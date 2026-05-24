import sqlite3
from pathlib import Path

# backend/app/core/db.py
# We anchor the path relative to backend/app (stable no matter where uvicorn is launched from)
PROJECT_ROOT = Path(__file__).resolve().parents[3]  # db.py -> core -> app -> backend -> project root
DB_PATH = PROJECT_ROOT / "backend" / "data" / "smokwit_totem.db"



def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn




def init_db() -> None:
    """
    Creates required tables if they don't exist.
    """
    conn = get_conn()
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    cur = conn.cursor()

    # 1) Questions table (content)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        answer_a TEXT NOT NULL,
        answer_b TEXT NOT NULL,
        correct TEXT NOT NULL CHECK (correct IN ('A','B')),
        fact TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
    );
    """)

    # 2) Answer logs (every click on A/B)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS answer_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        chosen TEXT NOT NULL CHECK (chosen IN ('A','B')),
        is_correct INTEGER NOT NULL CHECK (is_correct IN (0,1)),
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
    """)

    # 3) QR scan logs (every scan/hit on the tracking URL)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS qr_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        totem_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        user_agent TEXT,
        ip_hash TEXT
    );
    """)

    # 4) Help events (used for community help percentage over sliding windows)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS help_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_kind TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    """)

    # Backward-compatible migration for databases created before points column existed
    cols = cur.execute("PRAGMA table_info(help_events);").fetchall()
    has_points = any(str(r[1]) == "points" for r in cols)
    if not has_points:
        cur.execute("ALTER TABLE help_events ADD COLUMN points INTEGER NOT NULL DEFAULT 0;")

    # Helpful indexes
    cur.execute("CREATE INDEX IF NOT EXISTS idx_answer_logs_qid ON answer_logs(question_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_answer_logs_time ON answer_logs(created_at);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_qr_scans_totem ON qr_scans(totem_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_qr_scans_time ON qr_scans(created_at);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_help_events_kind ON help_events(event_kind);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_help_events_time ON help_events(created_at);")

    conn.commit()
    conn.close()


def seed_if_empty() -> None:
    """
    Inserts a few starter questions only if the questions table is empty.
    """
    conn = get_conn()
    cur = conn.cursor()

    row = cur.execute("SELECT COUNT(*) AS c FROM questions;").fetchone()
    count = int(row["c"]) if row else 0

    if count == 0:
        cur.executemany("""
        INSERT INTO questions (text, answer_a, answer_b, correct, fact)
        VALUES (?, ?, ?, ?, ?);
        """, [
            (
                "Tobacco is the cause of how many deaths each year worldwide?",
                "Around 8 million",
                "Around 5 million",
                "A",
                "Tobacco causes over 8 million deaths each year, including .3 million non-smokers exposed to secondhand smoke. (WHO)"
            ),
            (
                "How many chemicals are in cigarette smoke?",
                "Around 2,500",
                "Around 7,000",
                "B",
                "Cigarette smoke contains over 7,000 chemicals, hundreds of which are toxic and about 70 can cause cancer. (CDC)"
            ),
            (
                "Is nicotine as addictive as other hard drugs?",
                "Yes",
                "No",
                "A",
                "Nicotine is proven to be as addictive as substances like heroin and cocaine. (NIDA)"
            ),
        ])

        conn.commit()

    conn.close()
