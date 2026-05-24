from __future__ import annotations

from collections import defaultdict, deque
from threading import Lock
from time import time

from fastapi import Request

from backend.app.core.config import settings
from backend.app.core.errors import api_http_error, bad_request

_buckets: dict[str, deque[float]] = defaultdict(deque)
_lock = Lock()


def require_admin_key(request: Request) -> None:
    if not settings.metrics_api_key_required:
        return
    expected = (settings.admin_api_key or "").strip()
    if not expected:
        raise bad_request("missing_server_config", "admin API key not configured")
    provided = (request.headers.get("x-admin-api-key") or "").strip()
    if provided != expected:
        raise api_http_error(401, "unauthorized", "invalid admin API key")


def rate_limit_or_raise(key: str, limit: int, window_seconds: int) -> None:
    now = time()
    cutoff = now - window_seconds
    with _lock:
        bucket = _buckets[key]
        while bucket and bucket[0] < cutoff:
            bucket.popleft()
        if len(bucket) >= limit:
            raise api_http_error(429, "rate_limited", "too many requests")
        bucket.append(now)

