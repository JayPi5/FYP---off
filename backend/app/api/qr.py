import hashlib

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse

from backend.app.core.config import settings
from backend.app.core.db import get_conn
from backend.app.core.qr_destinations import resolve_qr_destination
from backend.app.core.security import rate_limit_or_raise
from backend.app.core.time_utils import within_cooldown
router = APIRouter()


def ip_hash(ip: str) -> str:
    return hashlib.sha256(ip.encode("utf-8")).hexdigest()


@router.get("/qr/{totem_id}")
def qr_scan(totem_id: str, request: Request):
    client = request.client.host if request.client else "unknown"
    rate_limit_or_raise(
        key=f"qr-scan:{client}",
        limit=settings.rate_limit_qr_per_window,
        window_seconds=settings.rate_limit_window_seconds,
    )

    conn = get_conn()
    cur = conn.cursor()

    ua = request.headers.get("user-agent", "") or ""
    client_ip = request.client.host if request.client else ""
    hashed = ip_hash(client_ip) if client_ip else ""

    should_insert = True
    if settings.qr_scan_cooldown_seconds > 0 and hashed:
        last = cur.execute(
            """
            SELECT created_at
            FROM qr_scans
            WHERE totem_id = ? AND ip_hash = ?
            ORDER BY id DESC
            LIMIT 1;
            """,
            (totem_id, hashed),
        ).fetchone()
        if last and within_cooldown(str(last["created_at"]), settings.qr_scan_cooldown_seconds):
            should_insert = False

    if should_insert:
        cur.execute(
            """
            INSERT INTO qr_scans (totem_id, user_agent, ip_hash)
            VALUES (?, ?, ?);
            """,
            (totem_id, ua, hashed),
        )
        conn.commit()

    conn.close()

    agent = (request.query_params.get("agent") or "").strip().lower()
    destination = (request.query_params.get("destination") or "").strip().lower()
    target = resolve_qr_destination(agent=agent or None, destination=destination or None)
    return RedirectResponse(url=target, status_code=302)
