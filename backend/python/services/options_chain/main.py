"""Options-chain snapshot service.

Every 30 seconds during market hours it captures a full options-chain snapshot
per symbol — computing first- and second-order Greeks, implied volatility, and
IV rank/percentile — then:

  * publishes the snapshot to options-chain-snapshots (key = symbol)
  * writes per-contract rows to the ClickHouse `options_chain` table
  * caches the latest snapshot in Redis (chain:{symbol}) for the API hot path

With a Polygon key it pulls the live options snapshot REST endpoint; without
one it synthesizes a chain from the BSM engine so the surface is still live.
"""

from __future__ import annotations

import json
import time
from collections import defaultdict, deque
from datetime import date, datetime, timedelta, timezone

from common import topics
from common.clickhouse import get_client, insert_dicts
from common.config import load
from common.greeks import bsm
from common.kafka import make_producer, produce
from common.logging import get_logger
from common.redis_client import get_redis

log = get_logger("options-chain")

SNAPSHOT_SECONDS = 30
RISK_FREE = 0.045
BASE_PRICES = {"SPY": 512.4, "QQQ": 438.9, "NVDA": 121.3, "AAPL": 224.8, "TSLA": 248.5, "AMD": 158.2}
BASE_VOL = {"SPY": 0.14, "QQQ": 0.18, "NVDA": 0.46, "AAPL": 0.22, "TSLA": 0.52, "AMD": 0.44}

# rolling ATM-IV history per symbol -> IV rank / percentile
_iv_history: dict[str, deque] = defaultdict(lambda: deque(maxlen=252))


def _next_expiry() -> date:
    return (datetime.now(timezone.utc) + timedelta(days=18)).date()


def _iv_rank_percentile(symbol: str, atm_iv: float) -> tuple[float, float]:
    hist = _iv_history[symbol]
    hist.append(atm_iv)
    if len(hist) < 2:
        return 50.0, 50.0
    lo, hi = min(hist), max(hist)
    rank = 0.0 if hi == lo else (atm_iv - lo) / (hi - lo) * 100.0
    below = sum(1 for v in hist if v < atm_iv)
    pct = below / len(hist) * 100.0
    return round(rank, 1), round(pct, 1)


def synth_chain(symbol: str) -> list[dict]:
    spot = BASE_PRICES.get(symbol, 100.0)
    vol = BASE_VOL.get(symbol, 0.3)
    step = 5.0 if spot > 200 else 2.5
    atm = round(spot / step) * step
    expiry = _next_expiry()
    t_years = max((datetime.combine(expiry, datetime.min.time(), tzinfo=timezone.utc) - datetime.now(timezone.utc)).days, 1) / 365.0
    snapshot_time = datetime.now(timezone.utc).replace(tzinfo=None)

    atm_iv = vol * 100.0
    iv_rank, iv_pct = _iv_rank_percentile(symbol, atm_iv)

    rows: list[dict] = []
    for i in range(-6, 7):
        strike = atm + i * step
        m = strike / spot
        for opt in ("CALL", "PUT"):
            iv = max(0.05, vol * (1 + abs(m - 1) * 1.6 + ((1 - m) * 0.4 if opt == "PUT" else 0)))
            g = bsm(spot, strike, t_years, RISK_FREE, iv, opt).as_dict()
            mid = max(0.02, g["price"])
            spread = max(0.02, mid * 0.02)
            rows.append({
                "symbol": symbol,
                "snapshot_time": snapshot_time,
                "expiration_date": expiry,
                "strike": float(strike),
                "option_type": opt,
                "bid": round(mid - spread / 2, 2),
                "ask": round(mid + spread / 2, 2),
                "mid": round(mid, 2),
                "last": round(mid, 2),
                "volume": 0,
                "open_interest": 0,
                "implied_volatility": round(iv * 100, 2),
                "delta": round(g["delta"], 5),
                "gamma": round(g["gamma"], 6),
                "theta": round(g["theta"], 5),
                "vega": round(g["vega"], 5),
                "rho": round(g["rho"], 5),
                "lambda": round(g["lambda"], 4),
                "epsilon": round(g["epsilon"], 4),
                "charm": round(g["charm"], 6),
                "vanna": round(g["vanna"], 5),
                "volga": round(g["volga"], 5),
                "speed": round(g["speed"], 7),
                "zomma": round(g["zomma"], 6),
                "color": round(g["color"], 7),
                "underlying_price": round(spot, 2),
                "underlying_iv": round(atm_iv, 2),
                "iv_rank": iv_rank,
                "iv_percentile": iv_pct,
            })
    return rows


def polygon_chain(cfg, symbol: str) -> list[dict] | None:
    import httpx

    url = f"https://api.polygon.io/v3/snapshot/options/{symbol}"
    try:
        resp = httpx.get(url, params={"apiKey": cfg.polygon_api_key, "limit": 250}, timeout=10)
        resp.raise_for_status()
        results = resp.json().get("results", [])
    except Exception as exc:  # noqa: BLE001
        log.warn("polygon chain fetch failed; synthesizing", symbol=symbol, err=str(exc))
        return None

    snapshot_time = datetime.now(timezone.utc).replace(tzinfo=None)
    spot = 0.0
    rows: list[dict] = []
    ivs: list[float] = []
    for r in results:
        det = r.get("details", {})
        greeks = r.get("greeks", {})
        day = r.get("day", {})
        quote = r.get("last_quote", {})
        ua = r.get("underlying_asset", {})
        spot = ua.get("price", spot) or spot
        iv = r.get("implied_volatility", 0.0) or 0.0
        ivs.append(iv)
        bid, ask = quote.get("bid", 0.0), quote.get("ask", 0.0)
        rows.append({
            "symbol": symbol,
            "snapshot_time": snapshot_time,
            "expiration_date": _parse_date(det.get("expiration_date")),
            "strike": float(det.get("strike_price", 0)),
            "option_type": "CALL" if det.get("contract_type") == "call" else "PUT",
            "bid": bid, "ask": ask, "mid": round((bid + ask) / 2, 2) if (bid or ask) else 0.0,
            "last": day.get("close", 0.0),
            "volume": int(day.get("volume", 0) or 0),
            "open_interest": int(r.get("open_interest", 0) or 0),
            "implied_volatility": round(iv * 100, 2),
            "delta": greeks.get("delta", 0.0), "gamma": greeks.get("gamma", 0.0),
            "theta": greeks.get("theta", 0.0), "vega": greeks.get("vega", 0.0), "rho": 0.0,
            "lambda": 0.0, "epsilon": 0.0, "charm": 0.0, "vanna": 0.0, "volga": 0.0,
            "speed": 0.0, "zomma": 0.0, "color": 0.0,
            "underlying_price": float(spot or 0), "underlying_iv": 0.0, "iv_rank": 0.0, "iv_percentile": 0.0,
        })
    if not rows:
        return None
    atm_iv = (sum(ivs) / len(ivs) * 100) if ivs else 0.0
    rank, pct = _iv_rank_percentile(symbol, atm_iv)
    for row in rows:
        row["underlying_iv"] = round(atm_iv, 2)
        row["iv_rank"], row["iv_percentile"] = rank, pct
    return rows


def _parse_date(s: str | None) -> date:
    if not s:
        return _next_expiry()
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        return _next_expiry()


def _json_safe(rows: list[dict]) -> list[dict]:
    out = []
    for r in rows:
        d = dict(r)
        d["snapshot_time"] = r["snapshot_time"].isoformat()
        d["expiration_date"] = r["expiration_date"].isoformat()
        out.append(d)
    return out


def main() -> None:
    cfg = load()
    producer = make_producer(cfg)
    ch = get_client(cfg)
    rds = get_redis(cfg)
    log.info("started", symbols=cfg.symbols, polygon=cfg.has_polygon, cadence_s=SNAPSHOT_SECONDS)

    while True:
        cycle_start = time.monotonic()
        for symbol in cfg.symbols:
            rows = (polygon_chain(cfg, symbol) if cfg.has_polygon else None) or synth_chain(symbol)
            safe = _json_safe(rows)
            try:
                insert_dicts(ch, "options_chain", rows)
            except Exception as exc:  # noqa: BLE001
                log.error("clickhouse insert failed", symbol=symbol, err=str(exc))
            produce(producer, topics.OPTIONS_CHAIN_SNAPSHOTS, symbol, {"symbol": symbol, "contracts": safe})
            try:
                rds.set(f"chain:{symbol}", json.dumps(safe), ex=60)
            except Exception as exc:  # noqa: BLE001
                log.warn("redis cache failed", symbol=symbol, err=str(exc))
        producer.flush(5)
        elapsed = time.monotonic() - cycle_start
        log.info("snapshot cycle complete", elapsed_s=round(elapsed, 2))
        time.sleep(max(0, SNAPSHOT_SECONDS - elapsed))


if __name__ == "__main__":
    main()
