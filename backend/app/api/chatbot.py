from __future__ import annotations

import os
import re
import subprocess
import tempfile
from pathlib import Path
from typing import List, Literal
from fastapi import Request
from typing import Optional
import hashlib

from backend.app.core.db import get_conn

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile
from faster_whisper import WhisperModel
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/chat", tags=["chatbot"])

# Ollama local server (default)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")

# Optional: small guardrails
MAX_USER_CHARS = int(os.getenv("CHATBOT_MAX_USER_CHARS", "500"))

SYSTEM_PROMPT = os.getenv(
    "CHATBOT_SYSTEM_PROMPT",
    (
        "You are Smokwit, a calm, supportive conversational assistant. "
        "Your purpose is to help people reflect on their smoking habits and gently support them in reducing or quitting smoking. "
        ""
        "CORE PRINCIPLES: "
        "Always be calm, respectful, and non-judgmental. "
        "Never shame, pressure, scare, or lecture the user. "
        "Never assume the user’s intentions or emotional state beyond what they explicitly say. "
        "Speak like a supportive human presence, not a doctor, therapist, authority figure, or automated service. "
        ""
        "BOUNDARIES AND SAFETY RULES: "
        "You are NOT a medical professional and must not give medical advice, diagnoses, or statistics. "
        "You are NOT a therapist and must not attempt to treat psychological trauma. "
        "You must not analyze the user’s mental health. "
        "If a topic feels heavy, slow down rather than pushing forward. "
        ""
        "EMOTIONAL SAFETY OVERRIDES (VERY IMPORTANT): "
        "If the user mentions grief, death, trauma, violence, deep sadness, anger, or emotional pain, "
        "immediately shift into a slower, more gentle mode. "
        "Acknowledge their feelings with empathy. "
        "Do NOT give advice, solutions, coping techniques, or actions in that moment. "
        "Do NOT reinterpret or reframe their experience. "
        "Offer calm presence and understanding only. "
        ""
        "If the user expresses frustration, resistance, or reluctance (for example: 'I don’t know', 'whatever', 'I don’t care'), "
        "do not challenge them. "
        "Respond with acceptance and keep the conversation open without pressure. "
        ""
        "If the user becomes silent, vague, or gives short answers, "
        "do not fill the silence aggressively. "
        "Respond gently or ask a very soft, optional question — or none at all. "
        ""
        "CONVERSATION STYLE: "
        "Keep responses short and clear: 1–2 sentences maximum. "
        "Use simple, natural language. "
        "Avoid lists unless absolutely necessary. "
        "Ask at most ONE gentle question per response — or zero if the moment is sensitive. "
        "Never ask multiple questions at once. "
        ""
        "GUIDANCE STRATEGY: "
        "Focus first on understanding why the user smokes (stress, routine, habit, emotions, social context). "
        "When appropriate, suggest very small, realistic steps that feel achievable right now. "
        "Frame suggestions as options, not instructions or obligations. "
        "Encourage reflection rather than control or performance. "
        ""
        "EXTERNAL RESOURCES: "
        "Do NOT mention hotlines, websites, or external services unless the user explicitly asks for them "
        "or clearly expresses ongoing distress over multiple turns. "
        ""
        "LANGUAGE RESTRICTIONS: "
        "Always reply in English, even if the user writes in another language. "
        "If the user uses another language, respond in English and gently invite them to use English. "
        "Do NOT mention being a kiosk, screen, system, AI model, or program. "
        "Do NOT mention rules, policies, or safety mechanisms. "
        "Do NOT use phrases like 'Would you like me to…' repeatedly. "
        ""
        "ENDING RESPONSES: "
        "End responses in a calm, open way that allows the conversation to continue naturally, "
        "without pressure, urgency, or expectation."
    ),
)

# -----------------------------
# Pydantic models
# -----------------------------

class HealthResponse(BaseModel):
    ok: bool
    model: str
    base_url: str


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=MAX_USER_CHARS)
    history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str


# -----------------------------
# Whisper (STT)
# -----------------------------

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")
_whisper_model: WhisperModel | None = None


def get_whisper_model() -> WhisperModel:
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = WhisperModel(
            WHISPER_MODEL_SIZE,
            device="cpu",
            compute_type="int8",
        )
    return _whisper_model


# A moderate (not gigantic) English stopword/core-word set tuned for short utterances.
# Goal: catch clearly-non-English Latin-letter outputs without rejecting normal short English.
_EN_COMMON = {
    # pronouns / helpers
    "i","me","my","mine","you","your","yours","we","our","ours","they","their","theirs",
    "he","him","his","she","her","hers","it","its",
    # articles / connectors
    "a","an","the","and","or","but","so","because","if","then","than","that","this","these","those",
    "just","really","maybe","also",
    # verbs (very common)
    "is","are","am","was","were","be","been","being",
    "do","does","did","doing",
    "have","has","had",
    "can","could","will","would","should",
    "want","need","feel","think","know","say","help",
    # prepositions
    "to","of","in","on","at","for","from","with","as","about","into","over","under",
    # negation / short answers
    "not","no","yes","ok","okay","sure",
    # question words
    "what","why","how","when","where","who",
    # time-ish common
    "today","now","later",
    # smoking context (helps keep valid niche short texts)
    "smoke","smoking","cigarette","cigarettes","quit","stop","craving","stress","stressed",
}

_VOWELS = set("aeiou")


def _is_mostly_ascii(text: str) -> bool:
    # Allow punctuation/emoji but reject heavy non-ascii
    ascii_count = sum(1 for ch in text if ord(ch) < 128)
    return (ascii_count / max(len(text), 1)) >= 0.90


def _english_like(text: str) -> bool:
    """
    Conservative: only reject when it's *unlikely* to be English.
    For very short texts (<=3 words), accept.
    """
    words = re.findall(r"[A-Za-z']+", text.lower())
    if len(words) <= 3:
        return True

    # stopword/core-word ratio
    common = sum(1 for w in words if w in _EN_COMMON)
    common_ratio = common / max(len(words), 1)

    # vowel density (helps catch consonant-heavy outputs)
    letters = [ch.lower() for ch in text if ch.isalpha()]
    if not letters:
        return False
    vowel_ratio = sum(1 for ch in letters if ch in _VOWELS) / max(len(letters), 1)

    # heuristic gate: accept if it looks English enough
    # - common_ratio catches non-English Latin sentences
    # - vowel_ratio catches weird/garbage (too low or too high)
    if common_ratio >= 0.20 and 0.28 <= vowel_ratio <= 0.55:
        return True

    # If it's very long but doesn't match these signals, reject
    if len(words) >= 6 and common_ratio < 0.15:
        return False

    # Otherwise, be permissive
    return True


# -----------------------------
# Routes
# -----------------------------

@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(ok=True, model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL)


@router.post("/respond", response_model=ChatResponse)
async def respond(payload: ChatRequest) -> ChatResponse:
    user_text = payload.message.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Empty message.")

    # Build message list (system + recent history + new user msg)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    MAX_TURNS = 10  # messages total, not pairs
    trimmed = payload.history[-MAX_TURNS:] if payload.history else []
    for m in trimmed:
        messages.append({"role": m.role, "content": m.content})

    messages.append({"role": "user", "content": user_text})

    req_json = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.3,
            "num_predict": 160,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            r = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=req_json)

        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Ollama error ({r.status_code}): {r.text[:200]}")

        data = r.json()
        reply = ((data.get("message") or {}).get("content") or "").strip()

        if not reply:
            raise HTTPException(status_code=502, detail="Ollama returned empty response.")

        return ChatResponse(reply=reply)

    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Cannot reach Ollama: {e}") from e


@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No audio file received")

    suffix = Path(file.filename or "").suffix.lower() or ".webm"

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        input_path = tmp / f"input{suffix}"
        wav_path = tmp / "audio.wav"

        data = await file.read()
        if not data or len(data) < 2000:
            return {"text": ""}

        input_path.write_bytes(data)

        # Convert to WAV (16kHz mono)
        try:
            p = subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-i", str(input_path),
                    "-ac", "1",
                    "-ar", "16000",
                    str(wav_path),
                ],
                capture_output=True,
                text=True,
            )
            if p.returncode != 0:
                raise HTTPException(status_code=500, detail=f"FFmpeg failed: {p.stderr[-800:]}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"FFmpeg exception: {repr(e)}")

        # Transcribe with language detection so we can gate non-English
        try:
            model = get_whisper_model()
            segments, info = model.transcribe(
                str(wav_path),
                vad_filter=True,
                language=None,     # ✅ detect language
                task="transcribe",
                beam_size=5,
            )

            text = " ".join(seg.text.strip() for seg in segments).strip()
            if not text:
                return {"text": ""}

            # If Whisper is confident it's not English, reject
            lang = getattr(info, "language", None)
            prob = float(getattr(info, "language_probability", 0.0) or 0.0)
            if lang and lang != "en" and prob >= 0.60:
                return {"text": ""}

            # Extra filters: keep it English-ish, avoid garbage
            if not _is_mostly_ascii(text):
                return {"text": ""}

            if not _english_like(text):
                return {"text": ""}

            return {"text": text}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Whisper failed: {repr(e)}")


