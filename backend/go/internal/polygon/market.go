package polygon

import (
	"fmt"
	"net/url"
	"strings"
	"time"
)

type intervalSpec struct {
	mult         int
	span         string
	lookbackDays int
}

var intervals = map[string]intervalSpec{
	"1m":  {1, "minute", 2},
	"5m":  {5, "minute", 5},
	"15m": {15, "minute", 10},
	"1h":  {1, "hour", 14},
	"1d":  {1, "day", 400},
}

type aggBar struct {
	T  int64   `json:"t"`
	O  float64 `json:"o"`
	H  float64 `json:"h"`
	L  float64 `json:"l"`
	C  float64 `json:"c"`
	V  float64 `json:"v"`
	VW float64 `json:"vw"`
	N  int     `json:"n"`
}

type aggsResp struct {
	Results []aggBar `json:"results"`
}

type CandleRow struct {
	Symbol       string  `json:"symbol"`
	Interval     string  `json:"interval"`
	OpenTime     string  `json:"open_time"`
	Open         float64 `json:"open"`
	High         float64 `json:"high"`
	Low          float64 `json:"low"`
	Close        float64 `json:"close"`
	Volume       float64 `json:"volume"`
	VWAP         float64 `json:"vwap"`
	Transactions int     `json:"transactions"`
}

type QuoteRow struct {
	Symbol               string  `json:"symbol"`
	Price                float64 `json:"price"`
	PrevClose            float64 `json:"prevClose"`
	Change               float64 `json:"change"`
	ChangePct            float64 `json:"changePct"`
	AfterHoursChange     float64 `json:"afterHoursChange"`
	AfterHoursChangePct  float64 `json:"afterHoursChangePct"`
	Timestamp            int64   `json:"timestamp"`
}

type NewsRow struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Author      string   `json:"author"`
	PublishedAt string   `json:"published_at"`
	URL         string   `json:"url"`
	Symbols     []string `json:"symbols"`
	Summary     string   `json:"summary"`
	Sentiment   float64  `json:"sentiment"`
}

func normalizeMs(t int64) int64 {
	if t > 1e15 {
		return t / 1_000_000
	}
	if t > 0 && t < 1e12 {
		return t * 1000
	}
	return t
}

func (c *Client) Candles(symbol, interval string, limit int) ([]CandleRow, string, error) {
	sym := strings.ToUpper(symbol)
	if limit <= 0 {
		limit = 200
	}
	if limit > 500 {
		limit = 500
	}
	spec, ok := intervals[interval]
	if !ok {
		spec = intervals["1d"]
		interval = "1d"
	}
	to := time.Now().UTC()
	from := to.AddDate(0, 0, -spec.lookbackDays)
	path := fmt.Sprintf("/v2/aggs/ticker/%s/range/%d/%s/%s/%s",
		sym, spec.mult, spec.span, from.Format("2006-01-02"), to.Format("2006-01-02"))
	raw, err := c.get(path, url.Values{"limit": {fmt.Sprintf("%d", limit)}, "sort": {"asc"}})
	if err != nil {
		return c.candlesFromPrev(sym, interval)
	}
	resp, err := decode[aggsResp](raw)
	if err != nil || len(resp.Results) == 0 {
		return c.candlesFromPrev(sym, interval)
	}
	bars := resp.Results
	if len(bars) > limit {
		bars = bars[len(bars)-limit:]
	}
	source := "polygon"
	if interval != "1d" && spec.span != "day" {
		source = "polygon"
	}
	out := make([]CandleRow, 0, len(bars))
	for _, b := range bars {
		vwap := b.VW
		if vwap == 0 {
			vwap = (b.O + b.C) / 2
		}
		out = append(out, CandleRow{
			Symbol: sym, Interval: interval,
			OpenTime: time.UnixMilli(b.T).UTC().Format(time.RFC3339),
			Open: b.O, High: b.H, Low: b.L, Close: b.C,
			Volume: b.V, VWAP: vwap, Transactions: b.N,
		})
	}
	return out, source, nil
}

func (c *Client) candlesFromPrev(sym, interval string) ([]CandleRow, string, error) {
	raw, err := c.get(fmt.Sprintf("/v2/aggs/ticker/%s/prev", sym), nil)
	if err != nil {
		return nil, "", err
	}
	resp, err := decode[aggsResp](raw)
	if err != nil || len(resp.Results) == 0 {
		return []CandleRow{}, "polygon-unavailable", nil
	}
	b := resp.Results[0]
	return []CandleRow{{
		Symbol: sym, Interval: interval,
		OpenTime: time.UnixMilli(b.T).UTC().Format(time.RFC3339),
		Open: b.O, High: b.H, Low: b.L, Close: b.C, Volume: b.V,
		VWAP: b.VW, Transactions: b.N,
	}}, "polygon-delayed", nil
}

func (c *Client) Quote(symbol string) (QuoteRow, string, error) {
	sym := strings.ToUpper(symbol)
	type snap struct {
		Ticker *struct {
			Day      *struct{ C float64 `json:"c"` } `json:"day"`
			PrevDay  *struct{ C float64 `json:"c"` } `json:"prevDay"`
			LastTrade *struct {
				P float64 `json:"p"`
				T int64   `json:"t"`
			} `json:"lastTrade"`
			Min *struct{ C float64 `json:"c"` } `json:"min"`
		} `json:"ticker"`
	}
	raw, err := c.get(fmt.Sprintf("/v2/snapshot/locale/us/markets/stocks/tickers/%s", sym), nil)
	if err != nil {
		return c.quoteFromDaily(sym)
	}
	resp, err := decode[snap](raw)
	if err != nil || resp.Ticker == nil {
		return c.quoteFromDaily(sym)
	}
	t := resp.Ticker
	prevClose := 0.0
	if t.PrevDay != nil {
		prevClose = t.PrevDay.C
	}
	price := prevClose
	if t.LastTrade != nil && t.LastTrade.P > 0 {
		price = t.LastTrade.P
	} else if t.Min != nil && t.Min.C > 0 {
		price = t.Min.C
	} else if t.Day != nil && t.Day.C > 0 {
		price = t.Day.C
	}
	dayClose := price
	if t.Day != nil && t.Day.C > 0 {
		dayClose = t.Day.C
	}
	change := price - prevClose
	changePct := 0.0
	if prevClose != 0 {
		changePct = (change / prevClose) * 100
	}
	ah := price - dayClose
	ahPct := 0.0
	if dayClose != 0 {
		ahPct = (ah / dayClose) * 100
	}
	ts := time.Now().UnixMilli()
	if t.LastTrade != nil {
		ts = normalizeMs(t.LastTrade.T)
	}
	return QuoteRow{
		Symbol: sym, Price: price, PrevClose: prevClose,
		Change: change, ChangePct: changePct,
		AfterHoursChange: ah, AfterHoursChangePct: ahPct,
		Timestamp: ts,
	}, "polygon", nil
}

func (c *Client) quoteFromDaily(sym string) (QuoteRow, string, error) {
	to := time.Now().UTC()
	from := to.AddDate(0, 0, -14)
	path := fmt.Sprintf("/v2/aggs/ticker/%s/range/1/day/%s/%s", sym, from.Format("2006-01-02"), to.Format("2006-01-02"))
	raw, err := c.get(path, url.Values{"sort": {"desc"}, "limit": {"5"}})
	if err != nil {
		return QuoteRow{}, "", err
	}
	resp, err := decode[aggsResp](raw)
	if err != nil || len(resp.Results) == 0 {
		return QuoteRow{}, "", fmt.Errorf("no quote data")
	}
	latest := resp.Results[0]
	prior := latest
	if len(resp.Results) > 1 {
		prior = resp.Results[1]
	}
	price := latest.C
	prevClose := prior.C
	if prevClose == 0 {
		prevClose = latest.O
	}
	change := price - prevClose
	changePct := 0.0
	if prevClose != 0 {
		changePct = (change / prevClose) * 100
	}
	return QuoteRow{
		Symbol: sym, Price: price, PrevClose: prevClose,
		Change: change, ChangePct: changePct,
		Timestamp: normalizeMs(latest.T),
	}, "polygon-delayed", nil
}

func (c *Client) News(symbol string) ([]NewsRow, string, error) {
	sym := strings.ToUpper(symbol)
	type article struct {
		ID           string   `json:"id"`
		Title        string   `json:"title"`
		Author       string   `json:"author"`
		PublishedUTC string   `json:"published_utc"`
		ArticleURL   string   `json:"article_url"`
		Tickers      []string `json:"tickers"`
		Description  string   `json:"description"`
	}
	type newsResp struct {
		Results []article `json:"results"`
	}
	raw, err := c.get("/v2/reference/news", url.Values{
		"ticker": {sym},
		"limit":  {"20"},
		"order":  {"desc"},
	})
	if err != nil {
		return nil, "", err
	}
	resp, err := decode[newsResp](raw)
	if err != nil {
		return nil, "", err
	}
	out := make([]NewsRow, 0, len(resp.Results))
	for _, a := range resp.Results {
		syms := a.Tickers
		if len(syms) == 0 {
			syms = []string{sym}
		}
		pub := a.PublishedUTC
		if pub == "" {
			pub = time.Now().UTC().Format(time.RFC3339)
		}
		out = append(out, NewsRow{
			ID: a.ID, Title: a.Title, Author: a.Author,
			PublishedAt: pub, URL: a.ArticleURL, Symbols: syms,
			Summary: a.Description,
		})
	}
	return out, "polygon", nil
}

func (c *Client) OptionsChain(symbol string) ([]map[string]any, string, error) {
	sym := strings.ToUpper(symbol)
	raw, err := c.get(fmt.Sprintf("/v3/snapshot/options/%s", sym), url.Values{"limit": {"250"}})
	if err != nil {
		return nil, "", err
	}
	type result struct {
		Details *struct {
			ExpirationDate string  `json:"expiration_date"`
			StrikePrice    float64 `json:"strike_price"`
			ContractType   string  `json:"contract_type"`
		} `json:"details"`
		Greeks *struct {
			Delta float64 `json:"delta"`
			Gamma float64 `json:"gamma"`
			Theta float64 `json:"theta"`
			Vega  float64 `json:"vega"`
		} `json:"greeks"`
		Day *struct {
			Close  float64 `json:"close"`
			Volume float64 `json:"volume"`
		} `json:"day"`
		LastQuote *struct {
			Bid float64 `json:"bid"`
			Ask float64 `json:"ask"`
		} `json:"last_quote"`
		OpenInterest       float64 `json:"open_interest"`
		ImpliedVolatility  float64 `json:"implied_volatility"`
		UnderlyingAsset    *struct {
			Price float64 `json:"price"`
		} `json:"underlying_asset"`
	}
	type chainResp struct {
		Results []result `json:"results"`
	}
	resp, err := decode[chainResp](raw)
	if err != nil {
		return nil, "", err
	}
	snapshotTime := time.Now().UTC().Format(time.RFC3339)
	spot := 0.0
	out := make([]map[string]any, 0, len(resp.Results))
	for _, r := range resp.Results {
		det := r.Details
		if det == nil {
			continue
		}
		if r.UnderlyingAsset != nil {
			spot = r.UnderlyingAsset.Price
		}
		greeks := r.Greeks
		quote := r.LastQuote
		day := r.Day
		bid, ask := 0.0, 0.0
		if quote != nil {
			bid, ask = quote.Bid, quote.Ask
		}
		mid := 0.0
		if bid > 0 || ask > 0 {
			mid = (bid + ask) / 2
		}
		optType := "CALL"
		if det.ContractType == "put" {
			optType = "PUT"
		}
		iv := r.ImpliedVolatility * 100
		row := map[string]any{
			"symbol": sym, "snapshot_time": snapshotTime,
			"expiration_date": det.ExpirationDate, "strike": det.StrikePrice,
			"option_type": optType, "bid": bid, "ask": ask, "mid": mid,
			"last": 0.0, "volume": 0.0, "open_interest": r.OpenInterest,
			"implied_volatility": iv, "underlying_price": spot,
		}
		if day != nil {
			row["last"] = day.Close
			row["volume"] = day.Volume
		}
		if greeks != nil {
			row["delta"] = greeks.Delta
			row["gamma"] = greeks.Gamma
			row["theta"] = greeks.Theta
			row["vega"] = greeks.Vega
		}
		out = append(out, row)
	}
	return out, "polygon", nil
}
