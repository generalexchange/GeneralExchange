package ws

import (
	"encoding/json"
	"log"
	"strings"
	"sync"
	"time"

	massivews "github.com/massive-com/client-go/v3/websocket"
	"github.com/massive-com/client-go/v3/websocket/models"
	"github.com/general-exchange/backend/internal/config"
)

const sourceMassive = "massive"

type marketFrame struct {
	Type string      `json:"type"`
	Data marketTick  `json:"data"`
}

type marketTick struct {
	Symbol    string  `json:"symbol"`
	Price     float64 `json:"price"`
	Volume    float64 `json:"volume,omitempty"`
	Timestamp int64   `json:"timestamp"`
	Source    string  `json:"source"`
}

type candleFrame struct {
	Type        string      `json:"type"`
	Data        candleTick  `json:"data"`
	ReplaceLast bool        `json:"replaceLast"`
}

type candleTick struct {
	Symbol    string  `json:"symbol"`
	Interval  string  `json:"interval"`
	OpenTime  int64   `json:"open_time"`
	Open      float64 `json:"open"`
	High      float64 `json:"high"`
	Low       float64 `json:"low"`
	Close     float64 `json:"close"`
	Volume    float64 `json:"volume"`
	VWAP      float64 `json:"vwap"`
}

func parseMassiveFeed(raw string) massivews.Feed {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "realtime", "real-time", "live":
		return massivews.RealTime
	case "delayed", "delay", "":
		return massivews.Delayed
	default:
		if strings.HasPrefix(raw, "wss://") {
			return massivews.Feed(raw)
		}
		return massivews.Delayed
	}
}

// StartMassiveFeed connects to Massive WebSocket and broadcasts to the hub.
// See https://github.com/massive-com/client-go
func StartMassiveFeed(cfg config.Config, hub *Hub) func() {
	apiKey := cfg.PolygonAPIKey
	if apiKey == "" {
		log.Printf("level=warn msg=\"massive ws disabled\" reason=\"missing POLYGON_API_KEY/MASSIVE_API_KEY\"")
		return func() {}
	}
	symbols := cfg.WSSymbols
	if len(symbols) == 0 {
		symbols = []string{"SPY"}
	}

	feed := parseMassiveFeed(cfg.MassiveWSFeed)
	client, err := massivews.New(massivews.Config{
		APIKey: apiKey,
		Feed:   feed,
		Market: massivews.Stocks,
	})
	if err != nil {
		log.Printf("level=error msg=\"massive ws client init failed\" err=%v", err)
		return func() {}
	}

	if err := client.Subscribe(massivews.StocksMinAggs, symbols...); err != nil {
		log.Printf("level=error msg=\"massive subscribe min aggs failed\" err=%v", err)
		client.Close()
		return func() {}
	}
	if err := client.Subscribe(massivews.StocksTrades, symbols...); err != nil {
		log.Printf("level=error msg=\"massive subscribe trades failed\" err=%v", err)
		client.Close()
		return func() {}
	}

	if err := client.Connect(); err != nil {
		log.Printf("level=error msg=\"massive ws connect failed\" err=%v feed=%s", err, feed)
		client.Close()
		return func() {}
	}

	log.Printf("level=info msg=\"massive ws connected\" feed=%s symbols=%s", feed, strings.Join(symbols, ","))

	done := make(chan struct{})
	var stopOnce sync.Once
	go func() {
		defer client.Close()
		for {
			select {
			case <-done:
				return
			case err := <-client.Error():
				if err != nil {
					log.Printf("level=error msg=\"massive ws error\" err=%v", err)
				}
				return
			case out, ok := <-client.Output():
				if !ok {
					return
				}
				if raw := encodeMassiveEvent(out); raw != nil {
					hub.Broadcast(raw)
				}
			}
		}
	}()

	return func() {
		stopOnce.Do(func() {
			close(done)
			client.Close()
		})
	}
}

func encodeMassiveEvent(out any) []byte {
	switch ev := out.(type) {
	case models.EquityTrade:
		if ev.Symbol == "" || ev.Price <= 0 {
			return nil
		}
		ts := ev.Timestamp
		if ts == 0 {
			ts = time.Now().UnixMilli()
		}
		raw, _ := json.Marshal(marketFrame{
			Type: "market",
			Data: marketTick{
				Symbol:    ev.Symbol,
				Price:     ev.Price,
				Volume:    float64(ev.Size),
				Timestamp: ts,
				Source:    sourceMassive,
			},
		})
		return raw
	case models.EquityAgg:
		if ev.Symbol == "" {
			return nil
		}
		openTime := ev.StartTimestamp
		if openTime == 0 {
			openTime = ev.EndTimestamp
		}
		if openTime == 0 {
			openTime = time.Now().UnixMilli()
		}
		vwap := ev.VWAP
		if vwap == 0 {
			vwap = ev.Close
		}
		raw, _ := json.Marshal(candleFrame{
			Type:        "candle",
			ReplaceLast: true,
			Data: candleTick{
				Symbol:   ev.Symbol,
				Interval: "1m",
				OpenTime: openTime,
				Open:     ev.Open,
				High:     ev.High,
				Low:      ev.Low,
				Close:    ev.Close,
				Volume:   ev.Volume,
				VWAP:     vwap,
			},
		})
		return raw
	default:
		return nil
	}
}
