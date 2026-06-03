// Package mock generates deterministic, shape-correct sample data so the API
// and WebSocket skeletons return realistic payloads before the ClickHouse /
// Redis / Redpanda data plane is wired in. Replace each generator with a query
// against the corresponding store; the JSON shapes are the contract.
package mock

import (
	"hash/fnv"
	"math"
	"math/rand"
	"time"
)

func seeded(symbol, salt string) *rand.Rand {
	h := fnv.New64a()
	_, _ = h.Write([]byte(symbol + "|" + salt))
	return rand.New(rand.NewSource(int64(h.Sum64())))
}

var basePrices = map[string]float64{
	"SPY": 512.4, "QQQ": 438.9, "NVDA": 121.3, "AAPL": 224.8, "TSLA": 248.5, "AMD": 158.2,
}

func basePrice(symbol string) float64 {
	if p, ok := basePrices[symbol]; ok {
		return p
	}
	return 100
}

/* ------------------------------- ticks -------------------------------- */

type Tick struct {
	Symbol     string    `json:"symbol"`
	Timestamp  time.Time `json:"timestamp"`
	Price      float64   `json:"price"`
	Size       uint32    `json:"size"`
	Exchange   string    `json:"exchange"`
	Conditions []string  `json:"conditions"`
	Tape       string    `json:"tape"`
}

func Ticks(symbol string, limit int) []Tick {
	r := seeded(symbol, "ticks")
	p := basePrice(symbol)
	out := make([]Tick, 0, limit)
	now := time.Now().UTC()
	for i := 0; i < limit; i++ {
		p += (r.Float64() - 0.5) * p * 0.0006
		out = append(out, Tick{
			Symbol:     symbol,
			Timestamp:  now.Add(-time.Duration(limit-i) * 250 * time.Millisecond),
			Price:      round(p, 2),
			Size:       uint32(r.Intn(900) + 100),
			Exchange:   "XNAS",
			Conditions: []string{"@"},
			Tape:       "C",
		})
	}
	return out
}

/* ------------------------------ candles ------------------------------- */

type Candle struct {
	Symbol       string    `json:"symbol"`
	Interval     string    `json:"interval"`
	OpenTime     time.Time `json:"open_time"`
	Open         float64   `json:"open"`
	High         float64   `json:"high"`
	Low          float64   `json:"low"`
	Close        float64   `json:"close"`
	Volume       uint64    `json:"volume"`
	VWAP         float64   `json:"vwap"`
	Transactions uint32    `json:"transactions"`
}

func Candles(symbol, interval string, limit int) []Candle {
	r := seeded(symbol, "candles-"+interval)
	p := basePrice(symbol) * 0.98
	step := intervalDuration(interval)
	out := make([]Candle, 0, limit)
	now := time.Now().UTC().Truncate(step)
	for i := 0; i < limit; i++ {
		o := p
		c := math.Max(1, o+(r.Float64()-0.47)*p*0.004)
		out = append(out, Candle{
			Symbol: symbol, Interval: interval,
			OpenTime: now.Add(-time.Duration(limit-i) * step),
			Open:     round(o, 2), High: round(math.Max(o, c)+r.Float64()*p*0.002, 2),
			Low: round(math.Min(o, c)-r.Float64()*p*0.002, 2), Close: round(c, 2),
			Volume: uint64(r.Intn(2_000_000) + 100_000), VWAP: round((o+c)/2, 2),
			Transactions: uint32(r.Intn(8000) + 500),
		})
		p = c
	}
	return out
}

func intervalDuration(interval string) time.Duration {
	switch interval {
	case "1m":
		return time.Minute
	case "5m":
		return 5 * time.Minute
	case "15m":
		return 15 * time.Minute
	case "1h":
		return time.Hour
	case "1d":
		return 24 * time.Hour
	default:
		return 5 * time.Minute
	}
}

/* --------------------------- options chain ---------------------------- */

type OptionContract struct {
	Symbol            string  `json:"symbol"`
	Expiration        string  `json:"expiration_date"`
	Strike            float64 `json:"strike"`
	Type              string  `json:"option_type"`
	Bid               float64 `json:"bid"`
	Ask               float64 `json:"ask"`
	Mid               float64 `json:"mid"`
	Last              float64 `json:"last"`
	Volume            uint32  `json:"volume"`
	OpenInterest      uint32  `json:"open_interest"`
	ImpliedVolatility float64 `json:"implied_volatility"`
	Delta             float64 `json:"delta"`
	Gamma             float64 `json:"gamma"`
	Theta             float64 `json:"theta"`
	Vega              float64 `json:"vega"`
	Rho               float64 `json:"rho"`
	Charm             float64 `json:"charm"`
	Vanna             float64 `json:"vanna"`
	Volga             float64 `json:"volga"`
	Speed             float64 `json:"speed"`
	Zomma             float64 `json:"zomma"`
	Color             float64 `json:"color"`
	UnderlyingPrice   float64 `json:"underlying_price"`
	IVRank            float64 `json:"iv_rank"`
}

func OptionsChain(symbol string) []OptionContract {
	r := seeded(symbol, "chain")
	spot := basePrice(symbol)
	step := 5.0
	if spot < 200 {
		step = 2.5
	}
	atm := math.Round(spot/step) * step
	out := []OptionContract{}
	for i := -6; i <= 6; i++ {
		strike := atm + float64(i)*step
		for _, typ := range []string{"CALL", "PUT"} {
			m := strike / spot
			iv := 0.18*(1+math.Abs(m-1)*1.6) + (r.Float64()-0.5)*0.02
			g := BSM(spot, strike, 18.0/365.0, 0.045, iv, typ)
			mid := math.Max(0.02, g.Price)
			spread := math.Max(0.02, mid*0.02)
			out = append(out, OptionContract{
				Symbol: symbol, Expiration: "2026-06-20", Strike: strike, Type: typ,
				Bid: round(mid-spread/2, 2), Ask: round(mid+spread/2, 2), Mid: round(mid, 2),
				Last: round(mid, 2), Volume: uint32(r.Intn(40000)), OpenInterest: uint32(r.Intn(120000)),
				ImpliedVolatility: round(iv*100, 1),
				Delta:             round(g.Delta, 4), Gamma: round(g.Gamma, 5), Theta: round(g.Theta, 4),
				Vega: round(g.Vega, 4), Rho: round(g.Rho, 4), Charm: round(g.Charm, 5), Vanna: round(g.Vanna, 4),
				Volga: round(g.Volga, 4), Speed: round(g.Speed, 6), Zomma: round(g.Zomma, 5), Color: round(g.Color, 6),
				UnderlyingPrice: round(spot, 2), IVRank: round(r.Float64()*100, 0),
			})
		}
	}
	return out
}

/* --------------------------- vol surface ------------------------------ */

type SurfacePoint struct {
	ExpirationDays uint16  `json:"expiration_days"`
	Moneyness      float64 `json:"moneyness"`
	IV             float64 `json:"iv"`
}

func Surface(symbol string) []SurfacePoint {
	r := seeded(symbol, "surface")
	out := []SurfacePoint{}
	for _, d := range []uint16{7, 14, 30, 60, 90, 180} {
		atm := 18 * (1 + float64(30-int(d))/600)
		for _, m := range []float64{0.9, 0.94, 0.97, 1.0, 1.03, 1.06, 1.1} {
			smile := math.Abs(m-1) * float64(140-int(d)) * 0.6
			out = append(out, SurfacePoint{ExpirationDays: d, Moneyness: m, IV: round(atm+smile+(r.Float64()-0.5)*2, 1)})
		}
	}
	return out
}

/* ------------------------------ signals ------------------------------- */

type Signal struct {
	SignalID    string    `json:"signal_id"`
	Symbol      string    `json:"symbol"`
	GeneratedAt time.Time `json:"generated_at"`
	SignalType  string    `json:"signal_type"`
	Direction   string    `json:"direction"`
	Confidence  float64   `json:"confidence"`
	Regime      string    `json:"regime"`
	IVRegime    string    `json:"iv_regime"`
	ExpiresAt   time.Time `json:"expires_at"`
}

var signalTypes = []string{"Gamma squeeze risk", "Premium-rich", "Momentum break", "Mean reversion", "Dealer flow", "Skew shift"}
var directions = []string{"LONG", "SHORT", "NEUTRAL"}
var trendRegimes = []string{"TRENDING", "RANDOM_WALK", "MEAN_REVERTING"}
var volRegimes = []string{"COMPRESSED", "NORMAL", "ELEVATED", "HIGH", "SPIKE"}

func Signals(symbol string) []Signal {
	r := seeded(symbol, "signals")
	now := time.Now().UTC()
	out := make([]Signal, 0, 6)
	for i := 0; i < 6; i++ {
		out = append(out, Signal{
			SignalID: randID(r), Symbol: symbol, GeneratedAt: now.Add(-time.Duration(i*7) * time.Minute),
			SignalType: signalTypes[r.Intn(len(signalTypes))], Direction: directions[r.Intn(3)],
			Confidence: round(0.45+r.Float64()*0.5, 2), Regime: trendRegimes[r.Intn(3)], IVRegime: volRegimes[r.Intn(5)],
			ExpiresAt: now.Add(time.Hour),
		})
	}
	return out
}

/* ------------------------------ regime -------------------------------- */

type Regime struct {
	Symbol         string    `json:"symbol"`
	DetectedAt     time.Time `json:"detected_at"`
	RegimeType     string    `json:"regime_type"`
	VolRegime      string    `json:"vol_regime"`
	HurstExponent  float64   `json:"hurst_exponent"`
	RealizedVol    float64   `json:"realized_vol"`
	ImpliedVol     float64   `json:"implied_vol"`
	Skew           float64   `json:"skew"`
	TermSlope      float64   `json:"term_slope"`
	DealerGEXTotal float64   `json:"dealer_gex_total"`
	PutCallRatio   float64   `json:"put_call_ratio"`
}

func RegimeState(symbol string) Regime {
	r := seeded(symbol, "regime")
	rv := round(14*(0.8+r.Float64()*0.5), 1)
	iv := round(18*(1+r.Float64()*0.4), 1)
	hurst := round(0.32+r.Float64()*0.4, 2)
	trend := "RANDOM_WALK"
	if hurst > 0.58 {
		trend = "TRENDING"
	} else if hurst < 0.42 {
		trend = "MEAN_REVERTING"
	}
	return Regime{
		Symbol: symbol, DetectedAt: time.Now().UTC(), RegimeType: trend,
		VolRegime: volRegimes[r.Intn(5)], HurstExponent: hurst, RealizedVol: rv, ImpliedVol: iv,
		Skew: round(r.Float64()*6+1, 1), TermSlope: round(0.85+r.Float64()*0.4, 2),
		DealerGEXTotal: round((r.Float64()-0.5)*200, 1), PutCallRatio: round(0.6+r.Float64()*0.9, 2),
	}
}

/* ------------------------------- news --------------------------------- */

type NewsItem struct {
	EventID        string    `json:"event_id"`
	PublishedAt    time.Time `json:"published_at"`
	Source         string    `json:"source"`
	Headline       string    `json:"headline"`
	Symbols        []string  `json:"symbols"`
	SentimentScore float64   `json:"sentiment_score"`
	ImpactScore    float64   `json:"impact_score"`
}

var headlines = []string{
	"Volatility compresses ahead of data print",
	"Options desks flag elevated near-term hedging",
	"Dealer positioning turns net short gamma",
	"Implied move widens into expiration",
	"Term structure flattens on macro relief",
}
var sources = []string{"Reuters", "Bloomberg", "WSJ", "CNBC"}

func News(symbol string) []NewsItem {
	r := seeded(symbol, "news")
	now := time.Now().UTC()
	out := make([]NewsItem, 0, 5)
	for i := 0; i < 5; i++ {
		out = append(out, NewsItem{
			EventID: randID(r), PublishedAt: now.Add(-time.Duration(i*23) * time.Minute),
			Source: sources[r.Intn(len(sources))], Headline: headlines[i%len(headlines)],
			Symbols: []string{symbol}, SentimentScore: round(r.Float64()*2-1, 2), ImpactScore: round(r.Float64(), 2),
		})
	}
	return out
}

/* ----------------------------- portfolio ------------------------------ */

type Position struct {
	Symbol       string  `json:"symbol"`
	Type         string  `json:"option_type"`
	Strike       float64 `json:"strike"`
	Quantity     int     `json:"quantity"`
	EntryPrice   float64 `json:"entry_price"`
	UnrealizedPL float64 `json:"unrealized_pnl"`
}

type Portfolio struct {
	UserID         string     `json:"user_id"`
	PortfolioValue float64    `json:"portfolio_value"`
	Cash           float64    `json:"cash"`
	DayPnL         float64    `json:"day_pnl"`
	TotalPnL       float64    `json:"total_pnl"`
	Positions      []Position `json:"positions"`
}

func PortfolioFor(userID string) Portfolio {
	r := seeded(userID, "portfolio")
	positions := []Position{}
	for _, s := range []string{"SPY", "NVDA", "QQQ"} {
		positions = append(positions, Position{
			Symbol: s, Type: "CALL", Strike: round(basePrice(s), 0), Quantity: r.Intn(10) + 1,
			EntryPrice: round(r.Float64()*8+1, 2), UnrealizedPL: round((r.Float64()-0.4)*2000, 0),
		})
	}
	return Portfolio{
		UserID: userID, PortfolioValue: 248410.32, Cash: 86204.18,
		DayPnL: 3182.45, TotalPnL: 48410.32, Positions: positions,
	}
}

func randID(r *rand.Rand) string {
	const hex = "0123456789abcdef"
	b := make([]byte, 8)
	for i := range b {
		b[i] = hex[r.Intn(16)]
	}
	return string(b)
}

func round(v float64, d int) float64 {
	p := math.Pow(10, float64(d))
	return math.Round(v*p) / p
}
