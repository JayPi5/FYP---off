from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.core.db import get_conn
from backend.app.core.errors import bad_request, not_found

router = APIRouter()

class AnswerIn(BaseModel):
    question_id: int
    chosen: str  # "A" or "B"

@router.get("/quiz/question")
def get_question():
    conn = get_conn()
    cur = conn.cursor()

    # Random active question
    row = cur.execute("""
        SELECT id, text, answer_a, answer_b, correct, fact
        FROM questions
        WHERE is_active = 1
        ORDER BY RANDOM()
        LIMIT 1;
    """).fetchone()

    conn.close()

    if row is None:
        raise not_found("no_questions", "No questions in database")

    return {
        "id": row["id"],
        "text": row["text"],
        "answers": {
            "A": row["answer_a"],
            "B": row["answer_b"],
        },
        "fact": row["fact"],
    }

@router.post("/quiz/answer")
def log_answer(payload: AnswerIn):
    chosen = payload.chosen.upper().strip()
    if chosen not in ("A", "B"):
        raise bad_request("invalid_choice", "chosen must be A or B")

    conn = get_conn()
    cur = conn.cursor()

    row = cur.execute("SELECT correct FROM questions WHERE id = ?;", (payload.question_id,)).fetchone()
    if row is None:
        conn.close()
        raise not_found("question_not_found", "question not found")

    is_correct = 1 if chosen == row["correct"] else 0

    cur.execute("""
        INSERT INTO answer_logs (question_id, chosen, is_correct)
        VALUES (?, ?, ?);
    """, (payload.question_id, chosen, is_correct))

    conn.commit()
    conn.close()

    return {"ok": True, "is_correct": bool(is_correct)}

@router.get("/quiz/questions")
def get_all_questions():
    conn = get_conn()
    cur = conn.cursor()

    rows = cur.execute("""
        SELECT id, text, answer_a, answer_b, correct, fact
        FROM questions
        WHERE is_active = 1;
    """).fetchall()

    conn.close()

    return [
        {
            "id": r["id"],
            "text": r["text"],
            "answers": {"A": r["answer_a"], "B": r["answer_b"]},
            "fact": r["fact"],
        }
        for r in rows
    ]
