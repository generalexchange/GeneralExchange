"""Structured JSON logging to stdout (shipped to OpenObserve in deployment)."""

from __future__ import annotations

import json
import sys
import time
from typing import Any


class Logger:
    def __init__(self, service: str) -> None:
        self.service = service

    def _emit(self, level: str, msg: str, **fields: Any) -> None:
        record = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()),
            "level": level,
            "service": self.service,
            "msg": msg,
            **fields,
        }
        stream = sys.stderr if level in ("error", "warn") else sys.stdout
        print(json.dumps(record), file=stream, flush=True)

    def info(self, msg: str, **f: Any) -> None:
        self._emit("info", msg, **f)

    def warn(self, msg: str, **f: Any) -> None:
        self._emit("warn", msg, **f)

    def error(self, msg: str, **f: Any) -> None:
        self._emit("error", msg, **f)


def get_logger(service: str) -> Logger:
    return Logger(service)
