
<template>
  <div class="viewport">
    <div class="stage" ref="stageEl">
      <div class="page">
        <header class="topbar" role="banner">
          <div class="topbar__left">
            <button class="iconBtn" type="button" @click="goBack" aria-label="Back to menu">
              <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
                <path
                  d="M15 18l-6-6 6-6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <div class="titleBlock">
              <div class="title">Smokwit Chat</div>
              <div class="subtitle">
                <span class="dot" aria-hidden="true"></span>
                <span>{{ statusText }}</span>
              </div>
            </div>
          </div>

          <div class="topbar__right">
            <div class="badge">Offline-first</div>
          </div>
        </header>

        <main class="chatShell" role="main">
          <div class="chat" ref="chatEl" aria-label="Chat messages">
            <div class="datePill">Today</div>

            <div
              v-for="m in messages"
              :key="m.id"
              class="row"
              :class="{ 'row--user': m.role === 'user', 'row--bot': m.role === 'bot' }"
            >
              <!-- Bot row: avatar left + bubble -->
              <template v-if="m.role === 'bot'">
                <div class="avatar" aria-hidden="true">
                  <img :src="magpieUrl" alt="" />
                </div>
                <div class="bubble bubble--bot">
                  <div class="bubble__text">{{ m.text }}</div>
                  <div class="bubble__meta">{{ formatTime(m.ts) }}</div>
                </div>
                <div class="ghost" aria-hidden="true"></div>
              </template>

              <!-- User row: bubble aligned right -->
              <template v-else>
                <div class="ghost" aria-hidden="true"></div>
                <div class="bubble bubble--user">
                  <div class="bubble__text">{{ m.text }}</div>
                  <div class="bubble__meta">{{ formatTime(m.ts) }}</div>
                </div>
                <div class="ghost" aria-hidden="true"></div>
              </template>
            </div>

            <div v-if="pending" class="row row--bot">
              <div class="avatar" aria-hidden="true">
                <img :src="magpieUrl" alt="" />
              </div>
              <div class="bubble bubble--bot bubble--typing" aria-label="Assistant typing">
                <span class="typingDot"></span>
                <span class="typingDot"></span>
                <span class="typingDot"></span>
              </div>
              <div class="ghost" aria-hidden="true"></div>
            </div>
          </div>

          <div class="composerWrap">
            <div class="composer">
              <button
                class="micBtn"
                type="button"
                :class="{ 'micBtn--active': isRecording }"
                @click="toggleMic"
                :disabled="pending"
                aria-label="Record voice message"
                :title="isRecording ? 'Stop recording' : 'Start recording'"
              >
                <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
                  <path
                    d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M19 11a7 7 0 0 1-14 0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M12 18v3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M8 21h8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>

              <input
                v-model="draft"
                class="input"
                type="text"
                inputmode="text"
                autocomplete="off"
                placeholder="Type a message…"
                @keydown.enter.prevent="send()"
                :disabled="pending || isRecording"
                aria-label="Type a message"
              />

              <button
                class="sendBtn"
                type="button"
                @click="send()"
                :disabled="pending || isRecording || !draftTrimmed"
                aria-label="Send"
              >
                <span>Send</span>
                <svg viewBox="0 0 24 24" class="icon icon--send" aria-hidden="true">
                  <path
                    d="M22 2 11 13"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M22 2 15 22l-4-9-9-4Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div class="hint">
              <span class="kbd">Enter</span> to send · Click <span class="kbd">🎙</span> to record, click again to send
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { chatRespond, postSTT } from "../services/api";
import magpieUrl from "../assets/magpie-off.png";
import type { ChatHistoryMessage } from "../services/api";
import { logTelemetry, makeSessionId } from "../services/telemetry";

type Role = "user" | "bot";
type Msg = { id: string; role: Role; text: string; ts: number };

const router = useRouter();

const messages = ref<Msg[]>([]);
const draft = ref("");
const pending = ref(false);

// Analytics session id
const sessionId = ref<string>("");

// Voice / STT
const isRecording = ref(false);
let recorder: MediaRecorder | null = null;
let recordedChunks: BlobPart[] = [];
let recordingStream: MediaStream | null = null;

const chatEl = ref<HTMLDivElement | null>(null);
const stageEl = ref<HTMLDivElement | null>(null);

const MAX_USER_TURNS = 9;
const REDIRECT_DELAY_MS = 8000;

let redirectTimer: number | null = null;
const redirectScheduled = ref(false);

const draftTrimmed = computed(() => draft.value.trim().length > 0);

const statusText = computed(() => {
  if (pending.value) return "Thinking…";
  if (isRecording.value) return "Recording…";
  return "Ready";
});

function nowId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

async function scrollToBottom() {
  await nextTick();
  const el = chatEl.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
}

function pushBot(text: string) {
  messages.value.push({ id: nowId(), role: "bot", text, ts: Date.now() });
}

function pushUser(text: string) {
  messages.value.push({ id: nowId(), role: "user", text, ts: Date.now() });
}

function goBack() {
  router.push("/modes");
}

function userTurnCount() {
  return messages.value.filter((m) => m.role === "user").length;
}

function scheduleQrRedirect() {
  if (redirectScheduled.value) return;

  redirectScheduled.value = true;

  // lock UI during the countdown
  pending.value = true;

  redirectTimer = window.setTimeout(() => {
    router.push({ path: "/qr", query: { mode: "chatbot", sid: sessionId.value } });
  }, REDIRECT_DELAY_MS);
}

async function sendText(text: string) {
  const msg = text.trim();
  if (!msg) return;

  pushUser(msg);

  // After the bot answers the 9th user message, redirect to QR after 8s
  if (userTurnCount() >= MAX_USER_TURNS) {
    scheduleQrRedirect();
  }

  await scrollToBottom();

  try {
    // Keep history reasonably short (last 12 messages)
    const history: ChatHistoryMessage[] = messages.value.slice(-12).map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.text,
    }));

    const res = await chatRespond({ message: msg, history });
    pushBot(res.reply);
  } catch (e) {
    pushBot("I couldn’t reach the assistant right now. Please try again in a moment.");
    console.error(e);
  } finally {
    await scrollToBottom();
  }
}

async function send() {
  const text = draft.value.trim();
  if (!text || pending.value || isRecording.value) return;

  draft.value = "";
  pending.value = true;
  await sendText(text);

  // Important: if redirect was scheduled, we keep pending=true
  if (!redirectScheduled.value) pending.value = false;
}

// Click mic once => start recording; click again => stop + transcribe + auto-send
async function toggleMic() {
  if (pending.value) return;

  // START
  if (!isRecording.value) {
    try {
      recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      recordedChunks = [];
      const options: MediaRecorderOptions = {};

      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options.mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        options.mimeType = "audio/webm";
      }

      recorder = new MediaRecorder(recordingStream, options);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunks.push(e.data);
      };

      recorder.onstop = async () => {
        // release mic hardware
        recordingStream?.getTracks().forEach((t) => t.stop());
        recordingStream = null;

        const blob = new Blob(recordedChunks, { type: recorder?.mimeType || "audio/webm" });
        recorder = null;
        recordedChunks = [];

        pending.value = true;
        try {
          const stt = await postSTT(blob);
          const text = (stt.text || "").trim();

          if (!text) {
            pushBot("I didn’t catch that—could you try again in English?");
            return;
          }

          await sendText(text);
        } catch (e) {
          console.error(e);
          pushBot("I couldn’t process the audio right now. Please try again.");
        } finally {
          // If redirect scheduled, keep pending=true
          if (!redirectScheduled.value) pending.value = false;
          await scrollToBottom();
        }
      };

      recorder.start(250);
      isRecording.value = true;
      return;
    } catch (err) {
      console.error(err);
      pushBot("Microphone access is blocked. Please allow mic permission and try again.");
      await scrollToBottom();
      return;
    }
  }

  // STOP
  isRecording.value = false;
  try {
    recorder?.stop(); // triggers onstop -> STT -> send
  } catch (e) {
    console.error(e);
  }
}

/**
 * Fixed 1920x1080 stage that scales to the viewport.
 */
function applyStageScale() {
  const el = stageEl.value;
  if (!el) return;

  const baseW = 1920;
  const baseH = 1080;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const scale = Math.min(vw / baseW, vh / baseH);
  el.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

onMounted(async () => {
  applyStageScale();
  window.addEventListener("resize", applyStageScale);

  sessionId.value = makeSessionId();
  await logTelemetry("chatbot", "VISIT", sessionId.value);

  pushBot("Hi — I’m Smokwit. What’s on your mind right now?");
  await scrollToBottom();
});

onUnmounted(() => {
  window.removeEventListener("resize", applyStageScale);

  if (redirectTimer !== null) {
    window.clearTimeout(redirectTimer);
    redirectTimer = null;
  }

  try {
    if (isRecording.value) recorder?.stop();
  } catch {}
  recordingStream?.getTracks().forEach((t) => t.stop());
});
</script>



<style scoped>
/* Full viewport container */
.viewport {
  width: 100vw;
  height: 100vh;
  background: #070a12;
  overflow: hidden;
}

/* 1920x1080 stage */
.stage {
  width: 1920px;
  height: 1080px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: top left;
}

/* Page */
.page {
  width: 100%;
  height: 100%;
  color: #e9eefc;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(56, 189, 248, 0.18), rgba(0, 0, 0, 0)),
    radial-gradient(900px 450px at 10% 10%, rgba(99, 102, 241, 0.18), rgba(0, 0, 0, 0)),
    linear-gradient(180deg, #0a0f1e 0%, #080b16 100%);
  display: flex;
  flex-direction: column;
}

/* Top bar (bigger) */
.topbar {
  height: 108px;
  padding: 22px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(10, 15, 30, 0.62);
  backdrop-filter: blur(10px);
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.iconBtn {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.05);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.icon {
  width: 26px;
  height: 26px;
}

.titleBlock {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title {
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.2px;
}

.subtitle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: rgba(233, 238, 252, 0.78);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.16);
}

.badge {
  font-size: 14px;
  font-weight: 800;
  padding: 10px 14px;
  border-radius: 999px;
  color: rgba(233, 238, 252, 0.92);
  background: rgba(56, 189, 248, 0.10);
  border: 1px solid rgba(56, 189, 248, 0.18);
}

/* Chat shell */
.chatShell {
  flex: 1;
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 0;
  padding: 22px 22px 22px;
  gap: 16px;
}

.chat {
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  padding: 22px 22px 14px;
  overflow: auto;
}

.datePill {
  width: fit-content;
  margin: 0 auto 14px;
  font-size: 14px;
  font-weight: 800;
  color: rgba(233, 238, 252, 0.74);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 8px 14px;
  border-radius: 999px;
}

/* Rows */
.row {
  display: grid;
  grid-template-columns: 64px 1fr 64px; /* bigger avatars / spacing */
  align-items: end;
  gap: 14px;
  margin: 14px 0;
}

.ghost {
  width: 64px;
  height: 64px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.22);
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Bubbles (bigger) */
.bubble {
  max-width: 1180px;
  padding: 16px 18px 12px;
  border-radius: 20px;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.bubble--bot {
  justify-self: start;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
  color: rgba(233, 238, 252, 0.96);
}

.bubble--user {
  justify-self: end; /* ✅ THIS puts it on the right */
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.24), rgba(56, 189, 248, 0.14));
  border-color: rgba(56, 189, 248, 0.20);
  color: rgba(255, 255, 255, 0.98);
}

.bubble__text {
  font-size: 22px; /* bigger */
  font-weight: 700;
  letter-spacing: 0.15px;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble__meta {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 800;
  color: rgba(233, 238, 252, 0.55);
  text-align: right;
}

/* Typing */
.bubble--typing {
  width: 140px;
  padding: 18px 18px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}
.typingDot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(233, 238, 252, 0.70);
  animation: bounce 1.1s infinite ease-in-out;
}
.typingDot:nth-child(2) {
  animation-delay: 0.12s;
}
.typingDot:nth-child(3) {
  animation-delay: 0.24s;
}
@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.55;
  }
  40% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

/* Composer (bigger) */
.composerWrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.composer {
  display: grid;
  grid-template-columns: 74px 1fr 170px;
  gap: 14px;
  align-items: center;
  padding: 16px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(10, 15, 30, 0.62);
  backdrop-filter: blur(10px);
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.30);
}

.input {
  height: 64px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(233, 238, 252, 0.98);
  padding: 0 18px;
  font-size: 20px;
  font-weight: 700;
  outline: none;
}
.input::placeholder {
  color: rgba(233, 238, 252, 0.45);
  font-weight: 650;
}

.sendBtn {
  height: 64px;
  border-radius: 18px;
  border: 1px solid rgba(56, 189, 248, 0.24);
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.30), rgba(56, 189, 248, 0.18));
  color: rgba(255, 255, 255, 0.98);
  font-size: 20px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.sendBtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.icon--send {
  width: 22px;
  height: 22px;
}

/* Mic (bigger) */
.micBtn {
  width: 74px;
  height: 64px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(233, 238, 252, 0.92);
  cursor: pointer;
  display: grid;
  place-items: center;
  user-select: none;
  touch-action: manipulation;
}
.micBtn--active {
  background: rgba(34, 197, 94, 0.16);
  border-color: rgba(34, 197, 94, 0.30);
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.12);
  color: rgba(233, 238, 252, 0.98);
}

/* Hint */
.hint {
  font-size: 14px;
  color: rgba(233, 238, 252, 0.64);
  padding: 0 8px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.kbd {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(233, 238, 252, 0.90);
  font-weight: 900;
}
</style>
