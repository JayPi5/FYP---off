from fastapi import APIRouter, Request
from pydantic import BaseModel

from backend.app.core.config import settings
from backend.app.core.db import get_conn
from backend.app.core.errors import bad_request
from backend.app.core.security import rate_limit_or_raise
from backend.app.core.time_utils import within_cooldown

router = APIRouter()

ALLOWED_EVENT_KINDS = frozenset(
    {"assist", "offers", "app_link", "session_complete", "progress", "abandon"}
)


class HelpEventIn(BaseModel):
    event_kind: str
    points: int | None = None


@router.post("/discussion/help-event")
def log_help_event(payload: HelpEventIn, request: Request):
    client = request.client.host if request.client else "unknown"
    rate_limit_or_raise(
        key=f"help-event:{client}",
        limit=settings.rate_limit_help_event_per_window,
        window_seconds=settings.rate_limit_window_seconds,
    )

    event_kind = payload.event_kind.strip().lower()
    if event_kind not in ALLOWED_EVENT_KINDS:
        raise bad_request("invalid_event_kind", "invalid event_kind")

    points = int(payload.points or 0)
    if event_kind == "progress":
        if points < 1 or points > 5:
            raise bad_request("invalid_points", "points must be between 1 and 5 for progress")
    else:
        points = 0

    conn = get_conn()
    cur = conn.cursor()

    if settings.help_event_dedupe_seconds > 0:
        last = cur.execute(
            """
            SELECT created_at
            FROM help_events
            WHERE event_kind = ? AND points = ?
            ORDER BY id DESC
            LIMIT 1;
            """,
            (event_kind, points),
        ).fetchone()
        if last and within_cooldown(str(last["created_at"]), settings.help_event_dedupe_seconds):
            conn.close()
            return {"ok": True, "deduped": True}

    cur.execute(
        """
        INSERT INTO help_events (event_kind, points)
        VALUES (?, ?);
        """,
        (event_kind, points),
    )
    conn.commit()
    conn.close()
    return {"ok": True, "deduped": False}
