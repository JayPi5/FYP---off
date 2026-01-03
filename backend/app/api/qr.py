from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
import hashlib

from backend.app.core.db import get_conn

router = APIRouter()

# ✅ change later to your real Smokwit web URL
DESTINATION_URL = "https://www.wikipedia.org/"

def ip_hash(ip: str) -> str:
    # simple hash so you don't store raw IP
    return hashlib.sha256(ip.encode("utf-8")).hexdigest()

@router.get("/qr/{totem_id}")
def qr_scan(totem_id: str, request: Request):
    conn = get_conn()
    cur = conn.cursor()

    ua = request.headers.get("user-agent", "") or ""

    # best effort to get client IP (works locally; behind proxy you’d configure forwarded headers)
    client_ip = request.client.host if request.client else ""
    hashed = ip_hash(client_ip) if client_ip else ""

    cur.execute("""
        INSERT INTO qr_scans (totem_id, user_agent, ip_hash)
        VALUES (?, ?, ?);
    """, (totem_id, ua, hashed))

    conn.commit()
    conn.close()

    return RedirectResponse(url=DESTINATION_URL, status_code=302)
