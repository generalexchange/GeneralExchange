"""Backtesting API (Phase 3).

The DuckDB walk-forward backtesting engine, exposed over HTTP. The Go API and
frontend submit strategy + parameter configs here; the engine loads historical
bars into DuckDB, simulates the options strategy with Black-Scholes pricing,
runs walk-forward validation with embargo and Monte Carlo robustness, promotes
results to ClickHouse, and stores the full artifact in FloppyDisk.

Every run is reproducible from its run_id (config + strategy version + seed are
all persisted). Submitting the same config returns the same run_id.

Endpoints
  POST /v1/backtest/run                 — run a backtest, return summary
  GET  /v1/backtest/results/{run_id}    — full artifact for a run
  GET  /v1/backtest/runs                — recent run summaries
  POST /v1/strategies/{id}/publish      — publish a strategy to FloppyDisk
  GET  /v1/strategies                   — list published strategies
  GET  /v1/strategies/{id}              — fetch a published strategy
"""

from __future__ import annotations

from collections import OrderedDict

from fastapi import Body, FastAPI, HTTPException, Query
from fastapi.responses import Response

from common import config as cfgmod
from common.clickhouse import get_client
from common.floppydisk import get_floppydisk
from common.logging import get_logger

from . import engine, store

log = get_logger("backtesting-api")
app = FastAPI(title="general.exchange backtesting-api")

_cfg = cfgmod.load()
_fd = get_floppydisk(_cfg)
_registry: "OrderedDict[str, dict]" = OrderedDict()  # run_id -> summary
_MAX_REGISTRY = 200


def _ch():
    try:
        return get_client(_cfg)
    except Exception:  # noqa: BLE001 — warehouse optional in local dev
        return None


def _summary(result: dict) -> dict:
    return {
        "run_id": result["run_id"],
        "status": result["status"],
        "created_at": result["created_at"],
        "symbol": result["config"]["symbol"],
        "strategy_id": result["config"]["strategy_id"],
        "data_source": result["data_source"],
        "bars": result["bars"],
        "metrics": result["metrics"],
        "monte_carlo": result["monte_carlo"],
        "walk_forward": result["walk_forward"],
    }


@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok", "floppydisk": "remote" if _cfg.has_floppydisk else "local-minio"}


@app.post("/v1/backtest/run")
def run_backtest(config: dict = Body(...)) -> dict:
    client = _ch()
    result = engine.run(config, client)

    # promote summary + trades to ClickHouse; full artifact to FloppyDisk
    ids = store.promote(client, result, user_id=config.get("user_id"))
    result["ch_run_id"] = ids["ch_run_id"]
    try:
        result["artifact_uri"] = _fd.put_artifact(result["run_id"], result)
    except Exception as e:  # noqa: BLE001
        log.warn("artifact store failed", run_id=result["run_id"], error=str(e))
        result["artifact_uri"] = None

    summary = _summary(result)
    summary["artifact_uri"] = result.get("artifact_uri")
    _registry[result["run_id"]] = summary
    while len(_registry) > _MAX_REGISTRY:
        _registry.popitem(last=False)

    log.info("backtest complete", run_id=result["run_id"], trades=result["metrics"]["total_trades"],
             sharpe=result["metrics"]["sharpe_ratio"], source=result["data_source"])
    return summary


@app.get("/v1/backtest/results/{run_id}")
def get_results(run_id: str) -> dict:
    artifact = _fd.get_artifact(run_id)
    if artifact is None:
        raise HTTPException(status_code=404, detail="run not found")
    return artifact


@app.get("/v1/backtest/runs")
def list_runs() -> dict:
    return {"runs": list(reversed(_registry.values()))}


@app.get("/v1/backtest/results/{run_id}/export")
def export_results(run_id: str, format: str = Query("csv", pattern="^(csv|json|parquet)$"),
                   dataset: str = Query("trades", pattern="^(trades|equity)$")):
    """Export a run's trades or equity curve as CSV, JSON, or Parquet.

    Uses DuckDB to materialize the table and pyarrow for Parquet, so exports are
    columnar and analysis-ready (the format firms ask for first).
    """
    artifact = _fd.get_artifact(run_id)
    if artifact is None:
        raise HTTPException(status_code=404, detail="run not found")
    rows = artifact.get(dataset, [])
    body, media = _serialize(rows, format)
    filename = f"{run_id}_{dataset}.{format}"
    return Response(
        content=body,
        media_type=media,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _serialize(rows: list[dict], fmt: str) -> tuple[bytes, str]:
    import json as _json

    if fmt == "json":
        return _json.dumps(rows, default=str).encode(), "application/json"

    import pyarrow as pa

    if not rows:
        return (b"", "application/vnd.apache.parquet" if fmt == "parquet" else "text/csv")

    table = pa.Table.from_pylist(rows)
    sink = pa.BufferOutputStream()
    if fmt == "parquet":
        import pyarrow.parquet as pq

        pq.write_table(table, sink)
        return sink.getvalue().to_pybytes(), "application/vnd.apache.parquet"
    import pyarrow.csv as pacsv

    pacsv.write_csv(table, sink)
    return sink.getvalue().to_pybytes(), "text/csv"


@app.post("/v1/strategies/{strategy_id}/publish")
def publish_strategy(strategy_id: str, definition: dict = Body(...)) -> dict:
    uri = _fd.publish_strategy(strategy_id, definition)
    log.info("strategy published", strategy_id=strategy_id, uri=uri)
    return {"strategy_id": strategy_id, "uri": uri, "version": definition.get("version", "v1")}


@app.get("/v1/strategies")
def list_strategies() -> dict:
    return {"strategies": _fd.list_strategies()}


@app.get("/v1/strategies/{strategy_id}")
def get_strategy(strategy_id: str) -> dict:
    s = _fd.get_strategy(strategy_id)
    if s is None:
        raise HTTPException(status_code=404, detail="strategy not found")
    return s
