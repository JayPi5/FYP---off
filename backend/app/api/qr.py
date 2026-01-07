from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
import hashlib
from typing import Optional

from backend.app.core.db import get_conn

router = APIRouter()

def ip_hash(ip: str) -> str:
    return hashlib.sha256(ip.encode("utf-8")).hexdigest()


@router.get("/qr/{totem_id}", response_class=HTMLResponse)
def qr_scan(
    totem_id: str,
    request: Request,
    mode: Optional[str] = "quiz",
    sid: Optional[str] = None,
):
    """
    This endpoint is hit when a phone scans a QR code.
    It is the ONLY place where a scan is counted.
    """

    ua = request.headers.get("user-agent", "") or ""
    client_ip = request.client.host if request.client else ""
    hashed_ip = ip_hash(client_ip) if client_ip else None

    mode = (mode or "quiz").lower()
    if mode not in ("quiz", "discussion", "chatbot"):
        mode = "quiz"

    conn = get_conn()
    cur = conn.cursor()

    # 🔹 New analytics table (authoritative)
    cur.execute("""
        INSERT INTO totem_events (
            totem_id,
            mode,
            event_type,
            session_id,
            user_agent,
            ip_hash
        )
        VALUES (?, ?, 'QR_SCAN', ?, ?, ?);
    """, (
        totem_id,
        mode,
        sid,
        ua,
        hashed_ip,
    ))

    conn.commit()
    conn.close()

    # Minimal phone-side response (no redirect needed for now)
    return """
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="font-family:system-ui; padding:24px;">
        <h2>✅ Scan enregistré</h2>
        <p>Vous pouvez fermer cette page.</p>
      </body>
    </html>
    """
