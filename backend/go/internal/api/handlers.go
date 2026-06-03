// Package api wires the REST routes for the Go data API (port 8080).
package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/general-exchange/backend/internal/httpx"
	"github.com/general-exchange/backend/internal/middleware"
	"github.com/general-exchange/backend/internal/mock"
)

func queryInt(r *http.Request, key string, fallback int) int {
	if v := r.URL.Query().Get(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

// GET /v1/ticks/{symbol}
func handleTicks(w http.ResponseWriter, r *http.Request) {
	symbol := r.PathValue("symbol")
	limit := queryInt(r, "limit", 200)
	httpx.OK(w, mock.Ticks(symbol, limit), time.Now().UTC(), "mock")
}

// GET /v1/candles/{symbol}/{interval}
func handleCandles(w http.ResponseWriter, r *http.Request) {
	symbol := r.PathValue("symbol")
	interval := r.PathValue("interval")
	limit := queryInt(r, "limit", 78)
	httpx.OK(w, mock.Candles(symbol, interval, limit), time.Now().UTC(), "mock")
}

// GET /v1/options/chain/{symbol}  — Redis first, falls back to ClickHouse
func handleOptionsChain(w http.ResponseWriter, r *http.Request) {
	symbol := r.PathValue("symbol")
	httpx.OK(w, mock.OptionsChain(symbol), time.Now().UTC(), "mock")
}

// GET /v1/options/surface/{symbol}
func handleOptionsSurface(w http.ResponseWriter, r *http.Request) {
	symbol := r.PathValue("symbol")
	httpx.OK(w, mock.Surface(symbol), time.Now().UTC(), "mock")
}

// GET /v1/signals/{symbol}
func handleSignals(w http.ResponseWriter, r *http.Request) {
	symbol := r.PathValue("symbol")
	httpx.OK(w, mock.Signals(symbol), time.Now().UTC(), "mock")
}

// GET /v1/regime/{symbol}
func handleRegime(w http.ResponseWriter, r *http.Request) {
	symbol := r.PathValue("symbol")
	httpx.OK(w, mock.RegimeState(symbol), time.Now().UTC(), "mock")
}

// GET /v1/news/{symbol}
func handleNews(w http.ResponseWriter, r *http.Request) {
	symbol := r.PathValue("symbol")
	httpx.OK(w, mock.News(symbol), time.Now().UTC(), "mock")
}

// POST /v1/backtest/run  (auth) — returns run summary (run_id + metrics)
func handleBacktestRun(w http.ResponseWriter, r *http.Request) {
	// Real path: forward to the Python DuckDB backtesting engine.
	if backtestEnabled() {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			httpx.Error(w, http.StatusBadRequest, "invalid backtest request body")
			return
		}
		if uid := middleware.UserID(r); uid != "" {
			body["user_id"] = uid
		}
		status, data, err := forwardBacktest(http.MethodPost, "/v1/backtest/run", body)
		if err != nil {
			httpx.Error(w, http.StatusBadGateway, "backtesting engine unavailable")
			return
		}
		writeUpstream(w, status, data)
		return
	}

	var req mock.BacktestRunRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid backtest request body")
		return
	}
	runID := mock.SubmitBacktest(req)
	httpx.OK(w, map[string]string{"run_id": runID, "status": "complete"}, time.Now().UTC(), "mock")
}

// GET /v1/backtest/results/{run_id}  (auth)
func handleBacktestResults(w http.ResponseWriter, r *http.Request) {
	runID := r.PathValue("run_id")
	if backtestEnabled() {
		status, data, err := forwardBacktest(http.MethodGet, "/v1/backtest/results/"+runID, nil)
		if err != nil {
			httpx.Error(w, http.StatusBadGateway, "backtesting engine unavailable")
			return
		}
		writeUpstream(w, status, data)
		return
	}

	res, ok := mock.BacktestResult(runID)
	if !ok {
		httpx.Error(w, http.StatusNotFound, "run_id not found")
		return
	}
	httpx.OK(w, res, res.CreatedAt, "mock")
}

// GET /v1/backtest/results/{run_id}/export?format=csv|parquet|json  (auth)
func handleBacktestExport(w http.ResponseWriter, r *http.Request) {
	if !backtestEnabled() {
		httpx.Error(w, http.StatusServiceUnavailable, "export requires the backtesting service")
		return
	}
	format := r.URL.Query().Get("format")
	if format == "" {
		format = "csv"
	}
	path := "/v1/backtest/results/" + r.PathValue("run_id") + "/export?format=" + format
	status, data, ctype, disp, err := forwardBacktestRaw(path)
	if err != nil {
		httpx.Error(w, http.StatusBadGateway, "backtesting engine unavailable")
		return
	}
	if ctype != "" {
		w.Header().Set("Content-Type", ctype)
	}
	if disp != "" {
		w.Header().Set("Content-Disposition", disp)
	}
	w.WriteHeader(status)
	_, _ = w.Write(data)
}

// POST /v1/strategies/{id}/publish  (auth) — publish to FloppyDisk via the engine
func handleStrategyPublish(w http.ResponseWriter, r *http.Request) {
	if !backtestEnabled() {
		httpx.Error(w, http.StatusServiceUnavailable, "strategy publishing requires the backtesting service")
		return
	}
	var def map[string]any
	if err := json.NewDecoder(r.Body).Decode(&def); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid strategy definition")
		return
	}
	status, data, err := forwardBacktest(http.MethodPost, "/v1/strategies/"+r.PathValue("id")+"/publish", def)
	if err != nil {
		httpx.Error(w, http.StatusBadGateway, "backtesting engine unavailable")
		return
	}
	writeUpstream(w, status, data)
}

// GET /v1/strategies  (auth) — list published strategies from FloppyDisk
func handleStrategyList(w http.ResponseWriter, r *http.Request) {
	if !backtestEnabled() {
		httpx.OK(w, map[string]any{"strategies": []any{}}, time.Now().UTC(), "mock")
		return
	}
	status, data, err := forwardBacktest(http.MethodGet, "/v1/strategies", nil)
	if err != nil {
		httpx.Error(w, http.StatusBadGateway, "backtesting engine unavailable")
		return
	}
	writeUpstream(w, status, data)
}

// GET /v1/strategies/{id}  (auth)
func handleStrategyGet(w http.ResponseWriter, r *http.Request) {
	if !backtestEnabled() {
		httpx.Error(w, http.StatusNotFound, "strategy not found")
		return
	}
	status, data, err := forwardBacktest(http.MethodGet, "/v1/strategies/"+r.PathValue("id"), nil)
	if err != nil {
		httpx.Error(w, http.StatusBadGateway, "backtesting engine unavailable")
		return
	}
	writeUpstream(w, status, data)
}

// GET /v1/portfolio  (auth)
func handlePortfolio(w http.ResponseWriter, r *http.Request) {
	httpx.OK(w, mock.PortfolioFor(middleware.UserID(r)), time.Now().UTC(), "mock")
}

// POST /v1/trade/paper  (auth)
func handlePaperTrade(w http.ResponseWriter, r *http.Request) {
	var order map[string]any
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid order body")
		return
	}
	// Real path: publish to the paper-trade-events Redpanda topic.
	order["status"] = "submitted"
	order["user_id"] = middleware.UserID(r)
	order["received_at"] = time.Now().UTC()
	httpx.OK(w, order, time.Now().UTC(), "mock")
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	httpx.OK(w, map[string]string{"status": "ok"}, time.Now().UTC(), "mock")
}
