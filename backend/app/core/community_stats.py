from __future__ import annotations

import sqlite3

from backend.app.core.config import Settings


def _count_events(cur: sqlite3.Cursor, event_kind: str, hours: int) -> int:
    row = cur.execute(
        """
        SELECT COUNT(*) AS c
        FROM help_events
        WHERE event_kind = ?
          AND datetime(created_at) >= datetime('now', ?);
        """,
        (event_kind, f"-{hours} hours"),
    ).fetchone()
    return int(row["c"]) if row else 0


def _count_scans(cur: sqlite3.Cursor, hours: int) -> int:
    row = cur.execute(
        """
        SELECT COUNT(*) AS c
        FROM qr_scans
        WHERE datetime(created_at) >= datetime('now', ?);
        """,
        (f"-{hours} hours",),
    ).fetchone()
    return int(row["c"]) if row else 0


def fetch_community_stats(cur: sqlite3.Cursor, settings: Settings) -> dict[str, int]:
    window = settings.stats_window_hours
    scans_8h = _count_scans(cur, window)
    scans_24h = _count_scans(cur, 24)

    help_points_row = cur.execute(
        """
        SELECT COALESCE(SUM(points), 0) AS p
        FROM help_events
        WHERE datetime(created_at) >= datetime('now', ?);
        """,
        (f"-{window} hours",),
    ).fetchone()
    help_points_8h = int(help_points_row["p"]) if help_points_row else 0
    help_percent_8h = min(
        100,
        round((help_points_8h / settings.help_target_points_8h) * 100),
    )

    return {
        "completed5A_24h": _count_events(cur, "session_complete", 24),
        "offers_24h": _count_events(cur, "offers", 24),
        "scans_24h": scans_24h,
        "abandons_24h": _count_events(cur, "abandon", 24),
        "scans_8h": scans_8h,
        "scan_percent_8h": min(100, scans_8h * settings.scan_percent_per_scan),
        "help_points_8h": help_points_8h,
        "help_percent_8h": help_percent_8h,
    }
