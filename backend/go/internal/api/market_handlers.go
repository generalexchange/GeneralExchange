package api

import (
	"net/http"
	"time"

	"github.com/general-exchange/backend/internal/config"
	"github.com/general-exchange/backend/internal/httpx"
	"github.com/general-exchange/backend/internal/marketcache"
)

var marketSvc *marketcache.Service

func initMarket(cfg config.Config) {
	if cfg.PolygonAPIKey == "" {
		return
	}
	marketSvc = marketcache.New(cfg.RedisURL, cfg.PolygonAPIKey)
}

func marketEnabled() bool {
	return marketSvc != nil
}

func marketUnavailable(w http.ResponseWriter, resource string) {
	httpx.Error(w, http.StatusServiceUnavailable, resource+" unavailable — configure POLYGON_API_KEY and Redis")
}

// GET /v1/quote/{symbol}
func handleQuote(w http.ResponseWriter, r *http.Request) {
	if !marketEnabled() {
		marketUnavailable(w, "quote")
		return
	}
	row, source, err := marketSvc.Quote(r.Context(), symbolFrom(r))
	if err != nil {
		httpx.Error(w, http.StatusBadGateway, "quote unavailable")
		return
	}
	httpx.OK(w, row, time.Now().UTC(), source)
}

// GET /v1/ticks/{symbol}
func handleTicks(w http.ResponseWriter, r *http.Request) {
	marketUnavailable(w, "ticks")
}

// GET /v1/candles/{symbol}/{interval}
func handleCandles(w http.ResponseWriter, r *http.Request) {
	if !marketEnabled() {
		marketUnavailable(w, "candles")
		return
	}
	limit := queryInt(r, "limit", 200)
	rows, source, err := marketSvc.Candles(r.Context(), symbolFrom(r), r.PathValue("interval"), limit)
	if err != nil {
		httpx.Error(w, http.StatusBadGateway, "candles unavailable")
		return
	}
	httpx.OK(w, rows, time.Now().UTC(), source)
}

// GET /v1/options/chain/{symbol}
func handleOptionsChain(w http.ResponseWriter, r *http.Request) {
	if !marketEnabled() {
		marketUnavailable(w, "options chain")
		return
	}
	rows, source, err := marketSvc.OptionsChain(r.Context(), symbolFrom(r))
	if err != nil {
		httpx.Error(w, http.StatusBadGateway, "options chain unavailable")
		return
	}
	httpx.OK(w, rows, time.Now().UTC(), source)
}

// GET /v1/options/surface/{symbol}
func handleOptionsSurface(w http.ResponseWriter, r *http.Request) {
	marketUnavailable(w, "options surface")
}

// GET /v1/signals/{symbol}
func handleSignals(w http.ResponseWriter, r *http.Request) {
	marketUnavailable(w, "signals")
}

// GET /v1/regime/{symbol}
func handleRegime(w http.ResponseWriter, r *http.Request) {
	marketUnavailable(w, "regime")
}

// GET /v1/news/{symbol}
func handleNews(w http.ResponseWriter, r *http.Request) {
	if !marketEnabled() {
		marketUnavailable(w, "news")
		return
	}
	rows, source, err := marketSvc.News(r.Context(), symbolFrom(r))
	if err != nil {
		httpx.Error(w, http.StatusBadGateway, "news unavailable")
		return
	}
	httpx.OK(w, rows, time.Now().UTC(), source)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	status := map[string]any{"status": "ok"}
	source := "unconfigured"
	if marketEnabled() {
		redisOK, polygonOK := marketSvc.Ready(r.Context())
		status["redis"] = redisOK
		status["polygon"] = polygonOK
		source = "live"
	}
	httpx.OK(w, status, time.Now().UTC(), source)
}

func symbolFrom(r *http.Request) string {
	return r.PathValue("symbol")
}
