from pathlib import Path
import json
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.exception_handlers import http_exception_handler
from fastapi.responses import JSONResponse
from fastapi import HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.api import api_router
from backend.app.api import qr
from backend.app.core.config import settings
from backend.app.core.db import init_db, seed_if_empty
from backend.app.core.observability import runtime_metrics

app = FastAPI(title=settings.app_title)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@app.on_event("startup")
def on_startup():
    if settings.startup_strict and settings.metrics_api_key_required and not (settings.admin_api_key or "").strip():
        raise RuntimeError("SMOKWIT_ADMIN_API_KEY is required when metrics key protection is enabled")
    if settings.metrics_api_key_required and not (settings.admin_api_key or "").strip():
        print(
            json.dumps(
                {
                    "type": "startup_warning",
                    "message": "metrics key protection enabled but admin key missing; metrics endpoint will reject requests",
                }
            )
        )
    init_db()
    seed_if_empty()


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_allow_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def access_log_and_metrics(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid4())
    t0 = perf_counter()
    try:
        response = await call_next(request)
    except Exception as exc:
        duration_ms = (perf_counter() - t0) * 1000
        runtime_metrics.record(500, duration_ms)
        print(
            json.dumps(
                {
                    "type": "error",
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status": 500,
                    "duration_ms": round(duration_ms, 2),
                    "error": str(exc.__class__.__name__),
                }
            )
        )
        raise

    duration_ms = (perf_counter() - t0) * 1000
    runtime_metrics.record(response.status_code, duration_ms)
    response.headers["x-request-id"] = request_id
    log_type = "access" if response.status_code < 500 else "error"
    payload = {
        "type": log_type,
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status": response.status_code,
        "duration_ms": round(duration_ms, 2),
    }
    if response.status_code >= 500:
        payload["error"] = "server_error"
    print(json.dumps(payload))
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "ok": False,
            "error": {
                "code": "validation_error",
                "message": "Request validation failed",
                "details": exc.errors(),
            },
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_wrapper(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content={"ok": False, "error": exc.detail},
        )
    return await http_exception_handler(request, exc)

app.include_router(api_router, prefix="/api")
app.include_router(qr.router)

# Serve frontend build (when it exists)
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        return FileResponse(STATIC_DIR / "index.html")
else:

    @app.get("/")
    def no_frontend_yet():
        return {"message": "Backend is running. Build the frontend and copy it to backend/static."}
