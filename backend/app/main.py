from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.api import api_router
from backend.app.api import qr
from backend.app.core.config import settings
from backend.app.core.db import init_db, seed_if_empty

app = FastAPI(title=settings.app_title)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@app.on_event("startup")
def on_startup():
    init_db()
    seed_if_empty()


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_allow_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
