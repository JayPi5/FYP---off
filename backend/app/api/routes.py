"""
Single composition root for versioned JSON API routes.

Routers declare full path segments (e.g. /quiz/... , /offers); this module
mounts them once under /api in main.py. QR redirect stays at /qr/... on the app.
"""
from fastapi import APIRouter, Request

from backend.app.api.quiz import router as quiz_router
from backend.app.api.offers import router as offers_router
from backend.app.api.community import router as community_router
from backend.app.api.discussion import router as discussion_router
from backend.app.core.observability import runtime_metrics
from backend.app.core.security import require_admin_key

api_router = APIRouter()


@api_router.get("/health", tags=["meta"])
def api_health():
    return {"ok": True}


@api_router.get("/metrics", tags=["meta"])
def api_metrics(request: Request):
    require_admin_key(request)
    return runtime_metrics.snapshot()

api_router.include_router(quiz_router, tags=["quiz"])
api_router.include_router(offers_router, tags=["offers"])
api_router.include_router(community_router, tags=["community"])
api_router.include_router(discussion_router, tags=["discussion"])
