from __future__ import annotations

from datetime import UTC, datetime, timedelta


def utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def parse_db_timestamp(raw: str) -> datetime:
    return datetime.fromisoformat(str(raw).replace(" ", "T"))


def within_cooldown(created_at_raw: str, cooldown_seconds: int) -> bool:
    if cooldown_seconds <= 0:
        return False
    created_at = parse_db_timestamp(created_at_raw)
    return utc_now() - created_at < timedelta(seconds=cooldown_seconds)
