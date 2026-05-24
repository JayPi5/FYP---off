from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import Lock
from time import perf_counter


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class RuntimeMetrics:
    started_at: str = field(default_factory=_utc_now_iso)
    requests_total: int = 0
    requests_2xx: int = 0
    requests_4xx: int = 0
    requests_5xx: int = 0
    total_duration_ms: float = 0.0
    last_request_at: str | None = None
    _lock: Lock = field(default_factory=Lock, repr=False)

    def record(self, status_code: int, duration_ms: float) -> None:
        with self._lock:
            self.requests_total += 1
            self.total_duration_ms += max(0.0, duration_ms)
            self.last_request_at = _utc_now_iso()
            if 200 <= status_code <= 299:
                self.requests_2xx += 1
            elif 400 <= status_code <= 499:
                self.requests_4xx += 1
            elif status_code >= 500:
                self.requests_5xx += 1

    def snapshot(self) -> dict:
        with self._lock:
            avg = self.total_duration_ms / self.requests_total if self.requests_total else 0.0
            return {
                "started_at": self.started_at,
                "requests_total": self.requests_total,
                "requests_2xx": self.requests_2xx,
                "requests_4xx": self.requests_4xx,
                "requests_5xx": self.requests_5xx,
                "avg_duration_ms": round(avg, 2),
                "last_request_at": self.last_request_at,
            }


runtime_metrics = RuntimeMetrics()

