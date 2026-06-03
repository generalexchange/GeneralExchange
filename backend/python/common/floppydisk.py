"""FloppyDisk client — the strategy-storage / sharing layer.

FloppyDisk (floppydisk.cc) is a *separate, external* service that hosts the
strategy marketplace: published strategy definitions, their backtest artifacts,
and signal parameter sets. It is not yet live, so the backtesting engine talks
to this interface rather than to any one backend directly.

Two implementations:

  * ``MinioFloppyDisk``  — local, works today. Stores artifacts/strategies in
    MinIO buckets. This is the default until floppydisk.cc ships.
  * ``HttpFloppyDisk``   — targets the real floppydisk.cc REST API. Selected
    automatically once ``FLOPPYDISK_URL`` is configured.

Engine code depends only on the ``FloppyDisk`` protocol, so switching to the
real service is a configuration change, not a code change.
"""

from __future__ import annotations

import io
import json
from typing import Protocol, runtime_checkable

from .config import Config
from .logging import get_logger

log = get_logger("floppydisk")

ARTIFACT_BUCKET = "backtest-artifacts"
STRATEGY_BUCKET = "strategies"


@runtime_checkable
class FloppyDisk(Protocol):
    """Storage + sharing surface the backtesting engine relies on."""

    def put_artifact(self, run_id: str, payload: dict) -> str:
        """Store a backtest artifact (full run JSON). Returns a stable URI."""

    def get_artifact(self, run_id: str) -> dict | None:
        ...

    def publish_strategy(self, strategy_id: str, definition: dict) -> str:
        """Publish a versioned strategy definition. Returns a stable URI."""

    def get_strategy(self, strategy_id: str) -> dict | None:
        ...

    def list_strategies(self) -> list[dict]:
        ...


# --------------------------------------------------------------------------- #
# MinIO-backed implementation (default, available today)
# --------------------------------------------------------------------------- #
class MinioFloppyDisk:
    def __init__(self, cfg: Config) -> None:
        self._cfg = cfg
        self._client_cache = None
        self._ensured = False

    @property
    def _client(self):
        # Lazy connect so the service can start before MinIO is reachable.
        if self._client_cache is None:
            from minio import Minio

            self._client_cache = Minio(
                self._cfg.minio_endpoint,
                access_key=self._cfg.minio_access_key,
                secret_key=self._cfg.minio_secret_key,
                secure=False,
            )
        if not self._ensured:
            for bucket in (ARTIFACT_BUCKET, STRATEGY_BUCKET):
                if not self._client_cache.bucket_exists(bucket):
                    self._client_cache.make_bucket(bucket)
            self._ensured = True
        return self._client_cache

    def _put(self, bucket: str, key: str, payload: dict) -> str:
        body = json.dumps(payload, default=str).encode()
        self._client.put_object(bucket, key, io.BytesIO(body), length=len(body), content_type="application/json")
        return f"floppydisk://{bucket}/{key}"

    def _get(self, bucket: str, key: str) -> dict | None:
        try:
            resp = self._client.get_object(bucket, key)
            return json.loads(resp.read())
        except Exception:  # noqa: BLE001 — missing object / network
            return None

    def put_artifact(self, run_id: str, payload: dict) -> str:
        return self._put(ARTIFACT_BUCKET, f"{run_id}.json", payload)

    def get_artifact(self, run_id: str) -> dict | None:
        return self._get(ARTIFACT_BUCKET, f"{run_id}.json")

    def publish_strategy(self, strategy_id: str, definition: dict) -> str:
        ver = definition.get("version", "v1")
        return self._put(STRATEGY_BUCKET, f"{strategy_id}/{ver}.json", definition)

    def get_strategy(self, strategy_id: str) -> dict | None:
        # latest by lexical version is sufficient for the local stand-in
        names = [o.object_name for o in self._client.list_objects(STRATEGY_BUCKET, prefix=f"{strategy_id}/")]
        if not names:
            return None
        return self._get(STRATEGY_BUCKET, sorted(names)[-1])

    def list_strategies(self) -> list[dict]:
        out: list[dict] = []
        for obj in self._client.list_objects(STRATEGY_BUCKET, recursive=True):
            out.append({"strategy_id": obj.object_name.split("/")[0], "uri": f"floppydisk://{STRATEGY_BUCKET}/{obj.object_name}"})
        return out


# --------------------------------------------------------------------------- #
# floppydisk.cc HTTP implementation (used once the service is live)
# --------------------------------------------------------------------------- #
class HttpFloppyDisk:
    def __init__(self, cfg: Config) -> None:
        import httpx

        self._base = cfg.floppydisk_url.rstrip("/")
        self._client = httpx.Client(
            base_url=self._base,
            headers={"Authorization": f"Bearer {cfg.floppydisk_api_key}"},
            timeout=15,
        )

    def put_artifact(self, run_id: str, payload: dict) -> str:
        self._client.put(f"/v1/artifacts/{run_id}", json=payload).raise_for_status()
        return f"{self._base}/v1/artifacts/{run_id}"

    def get_artifact(self, run_id: str) -> dict | None:
        r = self._client.get(f"/v1/artifacts/{run_id}")
        return r.json() if r.status_code == 200 else None

    def publish_strategy(self, strategy_id: str, definition: dict) -> str:
        self._client.put(f"/v1/strategies/{strategy_id}", json=definition).raise_for_status()
        return f"{self._base}/v1/strategies/{strategy_id}"

    def get_strategy(self, strategy_id: str) -> dict | None:
        r = self._client.get(f"/v1/strategies/{strategy_id}")
        return r.json() if r.status_code == 200 else None

    def list_strategies(self) -> list[dict]:
        r = self._client.get("/v1/strategies")
        return r.json() if r.status_code == 200 else []


def get_floppydisk(cfg: Config) -> FloppyDisk:
    """Return the active FloppyDisk client.

    Targets floppydisk.cc when FLOPPYDISK_URL is set; otherwise falls back to
    the local MinIO-backed implementation.
    """
    if cfg.has_floppydisk:
        log.info("using floppydisk.cc", url=cfg.floppydisk_url)
        return HttpFloppyDisk(cfg)
    log.info("floppydisk.cc not configured — using local MinIO stand-in")
    return MinioFloppyDisk(cfg)
