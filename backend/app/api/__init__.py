"""HTTP routers: use ``backend.app.api.routes.api_router`` as the /api composition root."""

from backend.app.api.routes import api_router

__all__ = ["api_router"]
