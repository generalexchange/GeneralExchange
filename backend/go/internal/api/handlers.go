// Package api wires the REST routes for the Go data API (port 8080).
package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/general-exchange/backend/internal/httpx"
	"github.com/general-exchange/backend/internal/middleware"
)

func queryInt(r *http.Request, key string, fallback int) int {
	if v := r.URL.Query().Get(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
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

	httpx.Error(w, http.StatusServiceUnavailable, "backtesting engine not configured")
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

	httpx.Error(w, http.StatusServiceUnavailable, "backtesting engine not configured")
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
		httpx.OK(w, map[string]any{"strategies": []any{}}, time.Now().UTC(), "unavailable")
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
	httpx.Error(w, http.StatusServiceUnavailable, "portfolio unavailable")
}

// POST /v1/trade/paper  (auth)
func handlePaperTrade(w http.ResponseWriter, r *http.Request) {
	httpx.Error(w, http.StatusServiceUnavailable, "paper trading unavailable")
}

