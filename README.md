# Smokwit Totem

FYP prototype — an interactive kiosk for **5A smoking-cessation discussions** (Ask, Advise, Assess, Assist, Arrange), set in the HEG Arc / Neuchâtel context.

Vue 3 handles the on-screen flow and magpie mascot. FastAPI + SQLite stores community stats, logs QR scans, and redirects to real resources (Smokwit, stop-tabac.ch, CIPRET, etc.).

More detail on structure and design: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Run the project

Needs **Python 3.12+**, **Node 20+**. Commands are for Windows PowerShell.

### First time

**Backend** (project root):

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
.\scripts\bootstrap_data.ps1
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

`bootstrap_data.ps1` creates `backend/data/offers.json` and `qr_destinations.json` from the example files if they're missing.

**Frontend** (second terminal):

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

| What | URL |
|------|-----|
| Main app | http://localhost:5173/discussion |
| Quiz | http://localhost:5173/quiz |
| API / Swagger | http://127.0.0.1:8000/docs |

Use `--host 0.0.0.0` on the backend so your phone can hit QR links on the same Wi‑Fi.

### Every other time

Terminal 1:

```powershell
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

---

## What it does

- **5A flow** — branching discussion from attract screen through to goodbye
- **Community HUD** — respiration + support gauges (8 h rolling window, from DB)
- **Magpie** — red / orange / green from support %; face changes with session mood
- **QR codes** — scan hits `/qr/TOTEM_001`, gets logged, redirects to the real URL
- **Offers** — cessation offers from JSON, filterable in the Arrange step
- **Sleep/wake** — idle overlay; touch to restart

Stack: Vue 3 + TypeScript + Vite · FastAPI · SQLite · Vitest + unittest · GitHub Actions CI

---

## Project layout

```
backend/app/api/     REST + QR redirect
backend/app/core/    db, config, stats, security
backend/data/        SQLite + offers.json + qr_destinations.json (gitignored)
backend/tests/

frontend/src/app/              shell, router, sleep overlay
frontend/src/features/discussion/   5A steps, flow model, magpie, QR
frontend/src/features/quiz/         quiz + standalone QR page
frontend/src/shared/           api client, config, HUD, community state
frontend/src/tests/
```

The 5A logic is a pure TypeScript state machine in `discussionFlowModel.ts` (no Vue imports), wired up in `useDiscussionFlow.ts`.

---

## 5A steps

| Phase | Steps |
|-------|-------|
| Attract | `Attract` |
| Ask | `A1` |
| Advise | `A2` |
| Assess | `A3`, `AssessApprox`, `AssessPrecise` |
| Assist | `AssistWithdrawal`, `AssistSupport`, `AssistPlan`, `AssistAppLink` |
| Arrange | `ArrangeOffersFiltred`, `ArrangeAppVersions`, `ArrangeQr` |
| Close | `Greetings`, `Bye` |

---

## HUD & magpie

Stats refresh every 30 s from `GET /api/community/stats`.

| Gauge | Source | Calculation |
|-------|--------|-------------|
| Respiration | `qr_scans` | 5 % per scan, capped at 100 % |
| Support | `help_events` points | points / 100 → %, capped at 100 % |

Magpie colour follows **support %** (defaults: red &lt; 31, orange 31–70, green ≥ 71 — tweak in `frontend/.env`).

---

## API

Swagger: http://127.0.0.1:8000/docs

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/health` | ok check |
| GET | `/api/community/stats` | HUD data + 24 h counters |
| POST | `/api/discussion/help-event` | `{ event_kind, points? }` |
| GET | `/api/offers` | from `offers.json` |
| GET | `/api/quiz/questions` | no correct answer in response |
| POST | `/api/quiz/answer` | `{ question_id, chosen }` → `{ is_correct }` |
| GET | `/qr/{totem_id}` | logs scan, 302 redirect. `?agent=` or `?destination=` |

Help event kinds: `progress`, `session_complete`, `offers`, `app_link`, `abandon`, `assist`.

---

## Config

**Frontend** — copy `frontend/.env.example` → `.env`:

| Variable | Default |
|----------|---------|
| `VITE_API_BASE` | `http://127.0.0.1:8000` |
| `VITE_TOTEM_ID` | `TOTEM_001` |
| `VITE_LED_GREEN_MIN_PERCENT` | `71` |
| `VITE_LED_ORANGE_MIN_PERCENT` | `31` |

**Backend** — optional env vars (defaults are fine for local dev):

| Variable | Default |
|----------|---------|
| `SMOKWIT_STATS_WINDOW_HOURS` | `8` |
| `SMOKWIT_SCAN_PERCENT_PER_SCAN` | `5` |
| `SMOKWIT_HELP_TARGET_POINTS_8H` | `100` |

Data files live in `backend/data/` — edit `offers.json` or `qr_destinations.json` and restart the backend.

---

## Tests

```powershell
# frontend
cd frontend
npm run test
npm run build

# backend (from project root)
.\venv\Scripts\python.exe -m unittest discover -s backend/tests -p "test_*.py"
```

CI runs both on push/PR (`.github/workflows/ci.yml`).

---

## Single-server demo

Build the frontend and serve it from FastAPI:

```powershell
cd frontend
npm run build
# copy dist/* → backend/static/
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

Then open http://127.0.0.1:8000/discussion

---

## Useful extras

DB backup:

```powershell
.\venv\Scripts\python.exe -m backend.scripts.backup_db
```

Metrics / health: `GET /api/metrics`, `GET /api/health`. Access logs are JSON on stdout; each response has `x-request-id`.

---

## Common issues

| Problem | Fix |
|---------|-----|
| Offers empty | Run `.\scripts\bootstrap_data.ps1` |
| QR goes to wrong URL | Restart backend after editing `qr_destinations.json` |
| HUD stuck at 0 % | Backend not running, or wrong `VITE_API_BASE` |
| Phone can't scan QR | Backend needs `--host 0.0.0.0`; set `VITE_API_BASE` to your LAN IP |

---

## Demo walkthrough (~5 min)

1. Wake the totem → HUD visible
2. A1 → A2 → show branching and magpie mood
3. A3 — approximate vs RTQ paths
4. A4 — assist branches + QR
5. A5 — filtered offers + Smokwit map QR
6. Scan QR from phone → respiration gauge goes up
7. Mention flow model + tests if asked

---

Academic FYP prototype — not clinical production software.
