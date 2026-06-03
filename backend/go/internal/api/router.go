package api

import (
	"context"
	"net/http"
	"time"

	"github.com/general-exchange/backend/internal/config"
	"github.com/general-exchange/backend/internal/keys"
	"github.com/general-exchange/backend/internal/metering"
	"github.com/general-exchange/backend/internal/middleware"
)

// NewRouter builds the REST mux with auth, tiered rate limiting, and usage
// metering per the API design: public market-data routes require an API key
// (rate-limited + metered by the key's tier); user routes require a JWT.
func NewRouter(cfg config.Config) http.Handler {
	mux := http.NewServeMux()
	limit := middleware.NewLimiter(100)
	backtestAPIURL = cfg.BacktestAPIURL

	// API-key store + usage meter, shared with middleware + handlers.
	keyStore = keys.NewStore(cfg.APIKeyEnforce)
	if cfg.DevAPIKey != "" {
		keyStore.Seed(cfg.DevAPIKey, "dev-firm", "bootstrap dev key", "enterprise")
	}
	usageMeter = metering.New()
	chHTTP := "http://" + cfg.ClickHouseHost + ":" + cfg.ClickHouseHTTPPort
	metering.StartFlusher(context.Background(), usageMeter, chHTTP, 10*time.Second)

	// public market data: API key -> tier rate limit -> quota + metering.
	pub := func(pattern string, h http.HandlerFunc) {
		mux.HandleFunc(pattern, middleware.RequireAPIKey(keyStore, limit.WrapTiered(middleware.Metered(usageMeter, h))))
	}
	// authenticated user routes (JWT)
	auth := func(pattern string, h http.HandlerFunc) {
		mux.HandleFunc(pattern, limit.Wrap(middleware.RequireJWT(cfg.JWTSecret, h)))
	}

	pub("GET /v1/ticks/{symbol}", handleTicks)
	pub("GET /v1/candles/{symbol}/{interval}", handleCandles)
	pub("GET /v1/options/chain/{symbol}", handleOptionsChain)
	pub("GET /v1/options/surface/{symbol}", handleOptionsSurface)
	pub("GET /v1/signals/{symbol}", handleSignals)
	pub("GET /v1/regime/{symbol}", handleRegime)
	pub("GET /v1/news/{symbol}", handleNews)

	auth("POST /v1/backtest/run", handleBacktestRun)
	auth("GET /v1/backtest/results/{run_id}", handleBacktestResults)
	auth("GET /v1/backtest/results/{run_id}/export", handleBacktestExport)
	auth("POST /v1/strategies/{id}/publish", handleStrategyPublish)
	auth("GET /v1/strategies", handleStrategyList)
	auth("GET /v1/strategies/{id}", handleStrategyGet)
	auth("GET /v1/portfolio", handlePortfolio)
	auth("POST /v1/trade/paper", handlePaperTrade)

	// firm API-key management + usage metering (JWT)
	auth("POST /v1/keys", handleCreateKey)
	auth("GET /v1/keys", handleListKeys)
	auth("DELETE /v1/keys/{id}", handleRevokeKey)
	auth("GET /v1/usage", handleUsage)

	mux.HandleFunc("GET /healthz", handleHealth)

	return middleware.Logging(withCORS(mux))
}

// withCORS allows the Next.js proxy / browser to call the API in dev.
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-API-Key")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
