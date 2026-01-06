from __future__ import annotations

import os
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel, Field
from typing import List, Literal
import subprocess
import tempfile
from pathlib import Path
from faster_whisper import WhisperModel

router = APIRouter(prefix="/api/chat", tags=["chatbot"])

# Ollama local server (default)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")

# Keep kiosk answers short + safe tone
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
        "Do NOT mention being a kiosk, screen, system, AI model, or program. "
        "Do NOT mention rules, policies, or safety mechanisms. "
        "Do NOT use phrases like 'Would you like me to…' repeatedly. "
        "Always be nice, never make any bad remarks to the user, never ever. be kind really"
        ""
        "ENDING RESPONSES: "
        "End responses in a calm, open way that allows the conversation to continue naturally, "
        "without pressure, urgency, or expectation."
    ),
)



# Optional: small guardrails
MAX_USER_CHARS = int(os.getenv("CHATBOT_MAX_USER_CHARS", "500"))


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=MAX_USER_CHARS)
    # If you want later: pass a conversation id, language, etc.
    # conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str


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


WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")

_whisper_model = None

def get_whisper_model() -> WhisperModel:
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = WhisperModel(
            WHISPER_MODEL_SIZE,
            device="cpu",
            compute_type="int8"
        )
    return _whisper_model

@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """
    Quick check that the API is alive + Ollama base URL configured.
    Doesn't call the model.
    """
    return HealthResponse(ok=True, model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL)


@router.post("/respond", response_model=ChatResponse)
async def respond(payload: ChatRequest) -> ChatResponse:
    user_text = payload.message.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Empty message.")

    # Build message list (system + recent history + new user msg)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Keep only last N messages to avoid huge context
    MAX_TURNS = 10  # (10 messages total, not pairs)
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

        # Read upload once
        data = await file.read()
        if not data or len(data) < 2000:
            # Too small = accidental click / silence
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
                raise HTTPException(
                    status_code=500,
                    detail=f"FFmpeg failed: {p.stderr[-800:]}"
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"FFmpeg exception: {repr(e)}")

        # Transcribe (FORCE LANGUAGE)
        try:
            model = get_whisper_model()
            segments, _ = model.transcribe(
                str(wav_path),
                vad_filter=True,
                language="en",      # 🔒 force English
                task="transcribe",
            )

            text = " ".join(seg.text.strip() for seg in segments).strip()

            # -----------------------------
            # 🔍 Filter bad / nonsense text
            # -----------------------------
            if not text:
                return {"text": ""}

            letters = sum(ch.isalpha() for ch in text)
            if letters / max(len(text), 1) < 0.45:
                # Too many weird symbols / wrong language
                return {"text": ""}

            return {"text": text}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Whisper failed: {repr(e)}")
