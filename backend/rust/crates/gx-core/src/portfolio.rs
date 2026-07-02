//! Authoritative portfolio reducer — pure fill + mark-to-market (Whitepaper v1.0 §4.3).

use crate::events::{EventBase, FillEvent, MarketDataEvent, PortfolioEvent, Position};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct PortfolioState {
    pub positions: HashMap<String, Position>,
    pub cash: f64,
    pub nav: f64,
    pub peak_nav: f64,
    pub drawdown: f64,
    pub gross_exposure: f64,
    pub net_exposure: f64,
    pub session_id: String,
}

impl PortfolioState {
    pub fn new(initial_cash: f64, session_id: impl Into<String>) -> Self {
        Self {
            positions: HashMap::new(),
            cash: initial_cash,
            nav: initial_cash,
            peak_nav: initial_cash,
            drawdown: 0.0,
            gross_exposure: 0.0,
            net_exposure: 0.0,
            session_id: session_id.into(),
        }
    }

    pub fn apply_fill(&mut self, fill: &FillEvent, market_price: f64, seq: u64) -> PortfolioEvent {
        let pos = self
            .positions
            .entry(fill.base.symbol.clone())
            .or_insert_with(|| Position {
                symbol: fill.base.symbol.clone(),
                qty: 0.0,
                avg_cost: 0.0,
                market_value: 0.0,
                unrealized_pnl: 0.0,
                realized_pnl: 0.0,
                day_pnl: 0.0,
            });

        let prev_qty = pos.qty;
        let prev_avg = pos.avg_cost;

        match fill.side.as_str() {
            "buy" => {
                let new_qty = prev_qty + fill.fill_qty;
                pos.avg_cost = if new_qty.abs() > f64::EPSILON {
                    (prev_qty * prev_avg + fill.fill_qty * fill.fill_price) / new_qty
                } else {
                    0.0
                };
                pos.qty = new_qty;
                self.cash -= fill.fill_qty * fill.fill_price + fill.commission;
            }
            "sell" => {
                let closed_qty = fill.fill_qty.min(prev_qty.abs());
                if closed_qty > 0.0 && prev_qty > 0.0 {
                    pos.realized_pnl += closed_qty * (fill.fill_price - prev_avg);
                }
                pos.qty = prev_qty - fill.fill_qty;
                self.cash += fill.fill_qty * fill.fill_price - fill.commission;
            }
            _ => {}
        }

        pos.market_value = pos.qty * market_price;
        pos.unrealized_pnl = pos.qty * (market_price - pos.avg_cost);

        self.recompute_nav();
        self.emit_portfolio_event(seq, fill.base.ts_exchange)
    }

    pub fn apply_market_data(&mut self, event: &MarketDataEvent) -> Option<PortfolioEvent> {
        let mut changed = false;
        if let Some(pos) = self.positions.get_mut(&event.base.symbol) {
            let new_unrealized = pos.qty * (event.price - pos.avg_cost);
            if (new_unrealized - pos.unrealized_pnl).abs() > 0.001 {
                pos.unrealized_pnl = new_unrealized;
                pos.market_value = pos.qty * event.price;
                changed = true;
            }
        }
        if changed {
            self.recompute_nav();
            Some(self.emit_portfolio_event(event.base.seq, event.base.ts_exchange))
        } else {
            None
        }
    }

    fn recompute_nav(&mut self) {
        let market_value: f64 = self.positions.values().map(|p| p.market_value).sum();
        self.nav = self.cash + market_value;
        self.gross_exposure = self.positions.values().map(|p| p.market_value.abs()).sum();
        self.net_exposure = self.positions.values().map(|p| p.market_value).sum();
        if self.nav > self.peak_nav {
            self.peak_nav = self.nav;
        }
        self.drawdown = if self.peak_nav > 0.0 {
            (self.peak_nav - self.nav) / self.peak_nav
        } else {
            0.0
        };
    }

    fn emit_portfolio_event(&self, trigger_seq: u64, ts: i64) -> PortfolioEvent {
        PortfolioEvent {
            base: EventBase {
                seq: trigger_seq,
                ts_exchange: ts,
                ts_ingest: chrono::Utc::now().timestamp_micros(),
                ts_emit: chrono::Utc::now().timestamp_micros(),
                source: "gx-engine/portfolio".into(),
                symbol: "PORTFOLIO".into(),
                session_id: self.session_id.clone(),
            },
            kind: "portfolio".into(),
            trigger_seq,
            positions: self.positions.clone(),
            cash: self.cash,
            nav: self.nav,
            gross_exposure: self.gross_exposure,
            net_exposure: self.net_exposure,
            leverage: if self.cash.abs() > f64::EPSILON {
                self.gross_exposure / self.cash.abs()
            } else {
                0.0
            },
            drawdown: self.drawdown,
            peak_nav: self.peak_nav,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::events::{EventBase, FillEvent};

    fn sample_fill(side: &str, qty: f64, price: f64) -> FillEvent {
        FillEvent {
            base: EventBase {
                seq: 1,
                ts_exchange: 0,
                ts_ingest: 0,
                ts_emit: 0,
                source: "test".into(),
                symbol: "SPY".into(),
                session_id: "s".into(),
            },
            kind: "fill".into(),
            order_id: "o1".into(),
            fill_id: "f1".into(),
            side: side.into(),
            fill_qty: qty,
            fill_price: price,
            commission: 0.0,
            liquidity: "taker".into(),
            is_simulated: true,
            slippage_bps: 2.0,
            exec_algo: "sim".into(),
        }
    }

    #[test]
    fn buy_updates_nav() {
        let mut p = PortfolioState::new(100_000.0, "s");
        let evt = p.apply_fill(&sample_fill("buy", 10.0, 450.0), 450.0, 1);
        assert_eq!(p.positions["SPY"].qty, 10.0);
        assert!(p.cash < 100_000.0);
        assert!((evt.nav - 100_000.0).abs() < 1.0);
    }
}
