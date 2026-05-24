import json
from pathlib import Path

from fastapi import APIRouter

from backend.app.core.errors import not_found

router = APIRouter()

_OFFERS_PATH = Path(__file__).resolve().parents[2] / "data" / "offers.json"
_cached: list | None = None
_cached_mtime: float | None = None


def _load_offers() -> list:
    global _cached, _cached_mtime
    if not _OFFERS_PATH.exists():
        raise not_found(
            "offers_file_missing",
            f"Offers file not found at {_OFFERS_PATH.name}. Run scripts/bootstrap_data.ps1",
        )

    mtime = _OFFERS_PATH.stat().st_mtime
    if _cached is None or _cached_mtime != mtime:
        with open(_OFFERS_PATH, encoding="utf-8") as f:
            _cached = json.load(f)
        _cached_mtime = mtime
    return _cached


@router.get("/offers")
def list_offers():
    return _load_offers()
