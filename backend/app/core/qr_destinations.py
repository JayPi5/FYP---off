import json
from pathlib import Path

_PATH = Path(__file__).resolve().parents[2] / "data" / "qr_destinations.json"
_cached: dict | None = None


def _load() -> dict:
    global _cached
    if _cached is None:
        with open(_PATH, encoding="utf-8") as f:
            _cached = json.load(f)
    return _cached


def resolve_qr_destination(agent: str | None = None, destination: str | None = None) -> str:
    data = _load()
    default = str(data.get("default") or "https://smokwit.ch/map")
    agents: dict = data.get("agents") or {}
    offers: dict = data.get("offers") or {}

    agent_key = (agent or "").strip().lower()
    if agent_key and agent_key in agents:
        return str(agents[agent_key])

    dest_key = (destination or "").strip().lower()
    if dest_key and dest_key in offers:
        return str(offers[dest_key])

    return default
