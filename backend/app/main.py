from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import quiz, qr

from backend.app.core.db import init_db, seed_if_empty

from backend.app.api.quiz import router as quiz_router



app = FastAPI(title="Smokwit Totem Local")

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

@app.on_event("startup")
def on_startup():
    init_db()
    seed_if_empty()

@app.get("/api/health")
def health():
    return {"ok": True}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(quiz_router, prefix="/api")
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
