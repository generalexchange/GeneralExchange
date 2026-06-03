"""Signal computation worker (Phase 4).

Fuses four input streams into composite trade signals and a microstructure
("market participant") view:

  * **candles-1m**       — price momentum + liquidity (volume z-score)
  * **options-chain-snapshots** — dealer gamma exposure (GEX), put/call skew,
    net delta tilt, options flow, unusual-activity, delta-squeeze pressure
  * **regime-events**    — current trend + volatility regime for context
  * **news-processed**   — decaying sentiment + news-impact overlay

On each options snapshot (the richest event) it:
  * writes a `market_participant_flow` row (dealer positioning + flow)
  * composes a signal (direction + confidence) into the `signals` table and the
    `signals` topic for the WS fan-out.

Gamma-exposure uses each contract's open interest where present; for synthetic
chains it falls back to a moneyness-weighted OI proxy so the gamma profile is
still meaningful.
"""

from __future__ import annotations

import math
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

import numpy as np

from common import topics
from common.clickhouse import get_client, insert_dicts
from common.config import load
from common.kafka import decode, make_consumer, make_producer, produce
from common.logging import get_logger

log = get_logger("signal-computation-worker")

CANDLE_WINDOW = 60
NEWS_HALF_LIFE_S = 1800.0  # sentiment impact decays with a 30-min half-life
FLUSH_SECONDS = 5.0
NS = uuid.UUID("0a51e000-0000-4000-8000-0000000000aa")


def _oi(contract: dict, spot: float) -> float:
    """Open interest, or a moneyness-weighted proxy for synthetic chains.

    Since gamma is identical for a call and put at the same strike, net dealer
    gamma is driven entirely by the call-vs-put OI skew. The proxy therefore
    peaks calls slightly above spot and puts slightly below, with puts carrying
    more open interest (the usual downside-hedging skew) so net GEX and the
    put/call ratio are realistic rather than canceling to zero.
    """
    oi = float(contract.get("open_interest", 0) or 0)
    if oi > 0:
        return oi
    strike = float(contract.get("strike", spot) or spot)
    m = (strike / spot - 1.0) if spot else 0.0
    is_put = contract.get("option_type") == "PUT"
    center = -0.012 if is_put else 0.012
    weight = 1.35 if is_put else 1.0
    return 1000.0 * weight * math.exp(-(((m - center) * 8.0) ** 2))


def options_metrics(contracts: list[dict]) -> dict:
    if not contracts:
        return {}
    spot = float(contracts[0].get("underlying_price", 0) or 0) or 1.0
    call_oi = put_oi = call_vol = put_vol = 0.0
    net_gex = net_delta = 0.0
    sweep_calls = sweep_puts = 0
    for c in contracts:
        is_call = c.get("option_type") == "CALL"
        oi = _oi(c, spot)
        vol = float(c.get("volume", 0) or 0)
        gamma = float(c.get("gamma", 0) or 0)
        delta = float(c.get("delta", 0) or 0)
        # dealers assumed long call gamma / short put gamma
        net_gex += gamma * oi * 100 * spot * spot * 0.01 * (1 if is_call else -1)
        net_delta += delta * oi * 100
        if is_call:
            call_oi += oi; call_vol += vol
            sweep_calls += 1 if vol > 0 and vol > oi else 0
        else:
            put_oi += oi; put_vol += vol
            sweep_puts += 1 if vol > 0 and vol > oi else 0

    total_oi = call_oi + put_oi
    total_vol = call_vol + put_vol
    put_call = (put_oi / call_oi) if call_oi else 1.0
    delta_tilt = (net_delta / (total_oi * 100)) if total_oi else 0.0
    if total_vol > 0:
        flow_score = (call_vol - put_vol) / total_vol
    else:
        flow_score = float(np.tanh(delta_tilt))
    unusual = float(np.clip(total_vol / total_oi if total_oi else 0.0, 0, 1))
    gamma_regime = "POSITIVE" if net_gex >= 0 else "NEGATIVE"
    # negative dealer gamma => hedging amplifies moves (squeeze pressure)
    delta_pressure = -net_gex * 0.01
    return {
        "spot": spot,
        "net_gamma_exposure": net_gex,
        "dealer_gamma_position": net_gex / 1e6,
        "estimated_delta_pressure": delta_pressure,
        "put_call_ratio": put_call,
        "delta_tilt": delta_tilt,
        "flow_score": flow_score,
        "unusual_activity": unusual,
        "gamma_regime": gamma_regime,
        "sweep_calls": sweep_calls,
        "sweep_puts": sweep_puts,
        "iv_rank": float(contracts[0].get("iv_rank", 0) or 0),
    }


class SymbolState:
    __slots__ = ("closes", "vols", "regime", "vol_regime", "news_score", "news_impact", "news_ts")

    def __init__(self) -> None:
        self.closes: deque = deque(maxlen=CANDLE_WINDOW)
        self.vols: deque = deque(maxlen=CANDLE_WINDOW)
        self.regime = "RANDOM_WALK"
        self.vol_regime = "NORMAL"
        self.news_score = 0.0
        self.news_impact = 0.0
        self.news_ts = 0.0

    def momentum(self) -> float:
        if len(self.closes) < 10:
            return 0.0
        p = np.array(self.closes, dtype=float)
        roc = (p[-1] - p[-10]) / p[-10] if p[-10] else 0.0
        return float(np.tanh(roc * 12))

    def liquidity(self) -> float:
        if len(self.vols) < 10:
            return 0.0
        v = np.array(self.vols, dtype=float)
        sd = v.std(ddof=1)
        if sd < 1e-9:
            return 0.0
        return float(np.clip((v[-1] - v.mean()) / sd, -3, 3) / 3)

    def decayed_sentiment(self, now: float) -> tuple[float, float]:
        if self.news_ts == 0.0:
            return 0.0, 0.0
        decay = 0.5 ** ((now - self.news_ts) / NEWS_HALF_LIFE_S)
        return self.news_score * decay, self.news_impact * decay


def compose_signal(st: SymbolState, om: dict, now: float) -> dict:
    momentum = st.momentum()
    liquidity = st.liquidity()
    sentiment, news_impact = st.decayed_sentiment(now)
    flow = om.get("flow_score", 0.0)
    delta_tilt = om.get("delta_tilt", 0.0)

    regime_bias = {"TRENDING_UP": 0.4, "TRENDING_DOWN": -0.4, "MEAN_REVERTING": 0.0, "RANDOM_WALK": 0.0}.get(st.regime, 0.0)
    # negative dealer gamma amplifies the prevailing direction
    gamma_amp = 1.25 if om.get("gamma_regime") == "NEGATIVE" else 0.85

    raw = (0.35 * momentum + 0.2 * flow + 0.15 * delta_tilt + 0.15 * sentiment + 0.15 * regime_bias) * gamma_amp
    raw = float(np.clip(raw, -1, 1))
    direction = "LONG" if raw > 0.15 else "SHORT" if raw < -0.15 else "NEUTRAL"
    confidence = float(np.clip(abs(raw) * (0.6 + 0.4 * min(len(st.closes) / CANDLE_WINDOW, 1)), 0, 1))

    if direction != "NEUTRAL" and om.get("gamma_regime") == "NEGATIVE" and abs(delta_tilt) > 0.2:
        signal_type = "DELTA_SQUEEZE"
    elif st.regime in ("TRENDING_UP", "TRENDING_DOWN"):
        signal_type = "MOMENTUM"
    elif st.regime == "MEAN_REVERTING":
        signal_type = "MEAN_REVERSION"
    else:
        signal_type = "FLOW"

    return {
        "signal_type": signal_type,
        "direction": direction,
        "confidence": round(confidence, 3),
        "raw_score": round(raw, 4),
        "momentum_score": round(momentum, 4),
        "liquidity_score": round(liquidity, 4),
        "sentiment_score": round(sentiment, 4),
        "news_impact_score": round(news_impact, 4),
        "options_flow_score": round(flow, 4),
        "dark_pool_score": round(om.get("unusual_activity", 0.0), 4),
        "delta_tilt": round(delta_tilt, 4),
        "gamma_regime": om.get("gamma_regime", "POSITIVE"),
    }


def main() -> None:
    cfg = load()
    consumer = make_consumer(cfg, "signal-computation-worker", [
        topics.CANDLES["1m"], topics.OPTIONS_CHAIN_SNAPSHOTS, topics.REGIME_EVENTS, topics.NEWS_PROCESSED,
    ])
    producer = make_producer(cfg)
    ch = get_client(cfg)

    state: dict[str, SymbolState] = defaultdict(SymbolState)
    pending_signals: list[dict] = []
    pending_flow: list[dict] = []
    last_flush = time.monotonic()
    log.info("started")

    def flush() -> None:
        nonlocal last_flush
        if pending_signals or pending_flow:
            try:
                if pending_signals:
                    insert_dicts(ch, "signals", pending_signals)
                if pending_flow:
                    insert_dicts(ch, "market_participant_flow", pending_flow)
                producer.flush(5)
                consumer.commit(asynchronous=False)
                log.info("flushed", signals=len(pending_signals), flow=len(pending_flow))
            except Exception as exc:  # noqa: BLE001
                log.error("flush failed; retrying", err=str(exc))
                return
            pending_signals.clear()
            pending_flow.clear()
        last_flush = time.monotonic()

    try:
        while True:
            msg = consumer.poll(0.5)
            if msg is None:
                if time.monotonic() - last_flush >= FLUSH_SECONDS:
                    flush()
                continue
            if msg.error():
                log.warn("consumer error", err=str(msg.error()))
                continue

            topic = msg.topic()
            ev = decode(msg)
            symbol = ev.get("symbol")
            if not symbol:
                continue
            st = state[symbol]
            now = time.monotonic()

            if topic == topics.CANDLES["1m"]:
                st.closes.append(float(ev.get("close", 0) or 0))
                st.vols.append(float(ev.get("volume", 0) or 0))
            elif topic == topics.REGIME_EVENTS:
                st.regime = ev.get("regime_type", st.regime)
                st.vol_regime = ev.get("vol_regime", st.vol_regime)
            elif topic == topics.NEWS_PROCESSED:
                st.news_score = float(ev.get("sentiment_score", 0) or 0)
                st.news_impact = float(ev.get("impact_score", 0) or 0)
                st.news_ts = now
            elif topic == topics.OPTIONS_CHAIN_SNAPSHOTS:
                om = options_metrics(ev.get("contracts", []))
                if not om:
                    continue
                generated_at = datetime.now(timezone.utc).replace(tzinfo=None)
                ts = generated_at

                pending_flow.append({
                    "symbol": symbol,
                    "timestamp": ts,
                    "dark_pool_prints": 0,
                    "dark_pool_volume": 0,
                    "options_sweep_calls": int(om["sweep_calls"]),
                    "options_sweep_puts": int(om["sweep_puts"]),
                    "block_trades": 0,
                    "unusual_activity_score": round(om["unusual_activity"], 4),
                    "net_gamma_exposure": round(om["net_gamma_exposure"], 2),
                    "dealer_gamma_position": round(om["dealer_gamma_position"], 4),
                    "estimated_delta_pressure": round(om["estimated_delta_pressure"], 2),
                })

                sig = compose_signal(st, om, now)
                iv_regime = "HIGH" if om["iv_rank"] > 66 else "LOW" if om["iv_rank"] < 33 else "MID"
                row = {
                    "signal_id": str(uuid.uuid4()),
                    "strategy_id": str(uuid.uuid5(NS, sig["signal_type"])),
                    "symbol": symbol,
                    "generated_at": generated_at,
                    "signal_type": sig["signal_type"],
                    "direction": sig["direction"],
                    "confidence": sig["confidence"],
                    "raw_score": sig["raw_score"],
                    "regime": st.regime,
                    "iv_regime": iv_regime,
                    "gamma_regime": sig["gamma_regime"],
                    "delta_tilt": sig["delta_tilt"],
                    "momentum_score": sig["momentum_score"],
                    "liquidity_score": sig["liquidity_score"],
                    "sentiment_score": sig["sentiment_score"],
                    "news_impact_score": sig["news_impact_score"],
                    "options_flow_score": sig["options_flow_score"],
                    "dark_pool_score": sig["dark_pool_score"],
                    "expires_at": generated_at + timedelta(hours=1),
                }
                pending_signals.append(row)
                produce(producer, topics.SIGNALS, symbol, {
                    **{k: (v.isoformat() if isinstance(v, datetime) else v) for k, v in row.items()},
                })

            if time.monotonic() - last_flush >= FLUSH_SECONDS:
                flush()
    finally:
        flush()
        consumer.close()
        producer.flush(5)


if __name__ == "__main__":
    main()
