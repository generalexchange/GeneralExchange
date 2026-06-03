package mock

import (
	"sync"
	"time"
)

// BacktestRunRequest is the payload for POST /v1/backtest/run.
type BacktestRunRequest struct {
	StrategyID      string  `json:"strategy_id"`
	Symbol          string  `json:"symbol"`
	StartDate       string  `json:"start_date"`
	EndDate         string  `json:"end_date"`
	Sizing          string  `json:"sizing"`
	SizingValue     float64 `json:"sizing_value"`
	MaxLossPerTrade float64 `json:"max_loss_per_trade"`
	Slippage        string  `json:"slippage"`
	WalkForward     bool    `json:"walk_forward"`
	Seed            int64   `json:"seed"`
}

// BacktestMetrics mirrors the backtest_runs ClickHouse table.
type BacktestMetrics struct {
	TotalTrades   int     `json:"total_trades"`
	WinRate       float64 `json:"win_rate"`
	ProfitFactor  float64 `json:"profit_factor"`
	SharpeRatio   float64 `json:"sharpe_ratio"`
	SortinoRatio  float64 `json:"sortino_ratio"`
	CalmarRatio   float64 `json:"calmar_ratio"`
	MaxDrawdown   float64 `json:"max_drawdown"`
	CAGR          float64 `json:"cagr"`
	TotalPnL      float64 `json:"total_pnl"`
}

// BacktestRunResult is the response from /v1/backtest/results/:run_id.
type BacktestRunResult struct {
	RunID     string          `json:"run_id"`
	Status    string          `json:"status"` // queued | running | complete
	Request   BacktestRunRequest `json:"request"`
	Metrics   BacktestMetrics `json:"metrics"`
	CreatedAt time.Time       `json:"created_at"`
}

// runStore is an in-memory stand-in for ClickHouse backtest_runs. The real
// backtesting-api (Python/DuckDB) promotes completed runs to ClickHouse.
var (
	runMu    sync.RWMutex
	runStore = map[string]*BacktestRunResult{}
)

// SubmitBacktest accepts a run request and returns a run id. Deterministic:
// the same request always yields the same id and metrics.
func SubmitBacktest(req BacktestRunRequest) string {
	r := seeded(req.StrategyID+req.Symbol+req.StartDate+req.EndDate, "backtest")
	id := randID(r) + randID(r)
	winRate := round(0.42+r.Float64()*0.2, 3)
	res := &BacktestRunResult{
		RunID:   id,
		Status:  "complete", // synchronous mock; real engine is async
		Request: req,
		Metrics: BacktestMetrics{
			TotalTrades:  80 + r.Intn(140),
			WinRate:      round(winRate*100, 1),
			ProfitFactor: round(1.0+r.Float64()*1.5, 2),
			SharpeRatio:  round(1.2+winRate, 2),
			SortinoRatio: round(1.5+winRate*1.3, 2),
			CalmarRatio:  round(0.8+r.Float64(), 2),
			MaxDrawdown:  round(-(8 + r.Float64()*14), 1),
			CAGR:         round(10+r.Float64()*40, 1),
			TotalPnL:     round((r.Float64()-0.2)*120000, 0),
		},
		CreatedAt: time.Now().UTC(),
	}
	runMu.Lock()
	runStore[id] = res
	runMu.Unlock()
	return id
}

// BacktestResult fetches a previously submitted run.
func BacktestResult(runID string) (*BacktestRunResult, bool) {
	runMu.RLock()
	defer runMu.RUnlock()
	res, ok := runStore[runID]
	return res, ok
}
