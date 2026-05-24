"""Application settings (no extra deps — tune via env later if needed)."""
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_title: str = "Smokwit Totem Local"
    cors_allow_origins: tuple[str, ...] = ("http://localhost:5173",)
    stats_window_hours: int = 8
    help_target_points_8h: int = 100
    scan_percent_per_scan: int = 5
    admin_api_key: str | None = None
    metrics_api_key_required: bool = False
    help_event_dedupe_seconds: int = 20
    qr_scan_cooldown_seconds: int = 10
    rate_limit_window_seconds: int = 60
    rate_limit_help_event_per_window: int = 60
    rate_limit_qr_per_window: int = 120
    startup_strict: bool = False


def _int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


settings = Settings(
    stats_window_hours=max(1, _int_env("SMOKWIT_STATS_WINDOW_HOURS", 8)),
    help_target_points_8h=max(1, _int_env("SMOKWIT_HELP_TARGET_POINTS_8H", 100)),
    scan_percent_per_scan=max(1, _int_env("SMOKWIT_SCAN_PERCENT_PER_SCAN", 5)),
    admin_api_key=os.getenv("SMOKWIT_ADMIN_API_KEY"),
    metrics_api_key_required=os.getenv("SMOKWIT_METRICS_API_KEY_REQUIRED", "0").strip() == "1",
    help_event_dedupe_seconds=max(0, _int_env("SMOKWIT_HELP_EVENT_DEDUPE_SECONDS", 20)),
    qr_scan_cooldown_seconds=max(0, _int_env("SMOKWIT_QR_SCAN_COOLDOWN_SECONDS", 10)),
    rate_limit_window_seconds=max(1, _int_env("SMOKWIT_RATE_LIMIT_WINDOW_SECONDS", 60)),
    rate_limit_help_event_per_window=max(1, _int_env("SMOKWIT_RATE_LIMIT_HELP_EVENT_PER_WINDOW", 60)),
    rate_limit_qr_per_window=max(1, _int_env("SMOKWIT_RATE_LIMIT_QR_PER_WINDOW", 120)),
    startup_strict=os.getenv("SMOKWIT_STARTUP_STRICT", "0").strip() == "1",
)
