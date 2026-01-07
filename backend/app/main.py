from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

# Core
from backend.app.core.db import init_db, seed_if_empty

# Routers
from backend.app.api.quiz import router as quiz_router
from backend.app.api.qr import router as qr_router



app = FastAPI(title="Smokwit Totem Local")

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


# --------------------
# Startup
# --------------------
@app.on_event("startup")
def on_startup():
    init_db()
    seed_if_empty()


# --------------------
# Health
# --------------------
@app.get("/api/health")
def health():
    return {"ok": True}


# --------------------
# CORS
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://10.1.1.125:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------
# API Routers
# --------------------
app.include_router(quiz_router, prefix="/api")
app.include_router(qr_router)                 # /qr/...
app.include_router(chatbot_router)             # /api/chat/...
# main.py



# --------------------
# Frontend (optional)
# --------------------
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        return FileResponse(STATIC_DIR / "index.html")
else:
    @app.get("/")
    def no_frontend_yet():
        return {"message": "Backend is running. Build the frontend and copy it to backend/static."}
