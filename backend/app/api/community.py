from fastapi import APIRouter

from backend.app.core.community_stats import fetch_community_stats
from backend.app.core.config import settings
from backend.app.core.db import get_conn

router = APIRouter()


@router.get("/community/stats")
def community_stats():
    conn = get_conn()
    cur = conn.cursor()
    payload = fetch_community_stats(cur, settings)
    conn.close()
    return payload
