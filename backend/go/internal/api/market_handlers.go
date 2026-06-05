package api

import (
	"net/http"
	"time"

	"github.com/general-exchange/backend/internal/config"
	"github.com/general-exchange/backend/internal/httpx"
)

func initMarket(_ config.Config) {}

func marketEnabled() bool { return false }

func marketUnavailable(w http.ResponseWriter, resource string) {
	httpx.Error(w, http.StatusServiceUnavailable, resource+" unavailable — use IBKR API service (see docs/IBKR_SETUP.md)")
}

func handleQuote(w http.ResponseWriter, _ *http.Request)       { marketUnavailable(w, "quote") }
func handleTicks(w http.ResponseWriter, _ *http.Request)        { marketUnavailable(w, "ticks") }
func handleCandles(w http.ResponseWriter, _ *http.Request)      { marketUnavailable(w, "candles") }
func handleOptionsChain(w http.ResponseWriter, _ *http.Request) { marketUnavailable(w, "options chain") }
func handleOptionsSurface(w http.ResponseWriter, _ *http.Request) {
	marketUnavailable(w, "options surface")
}
func handleSignals(w http.ResponseWriter, _ *http.Request) { marketUnavailable(w, "signals") }
func handleRegime(w http.ResponseWriter, _ *http.Request)  { marketUnavailable(w, "regime") }
func handleNews(w http.ResponseWriter, _ *http.Request)    { marketUnavailable(w, "news") }

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	httpx.OK(w, map[string]any{"status": "ok", "market_data": "ibkr"}, time.Now().UTC(), "ibkr")
}

func symbolFrom(r *http.Request) string { return r.PathValue("symbol") }
