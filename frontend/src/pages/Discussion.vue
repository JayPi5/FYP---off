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
              <div class="title">Discussion</div>
              <div class="subtitle">
                <span class="dot" :class="`dot--${stats.led}`" aria-hidden="true"></span>
                <span>Community pulse: {{ stats.led.toUpperCase() }}</span>
              </div>
            </div>
          </div>

          <div class="topbar__right">
            <div class="gauge">
              <div class="gLabel">Breathing</div>
              <div class="gValue">{{ stats.breathing }}</div>
            </div>
            <div class="gauge">
              <div class="gLabel">Support</div>
              <div class="gValue">{{ stats.humanSupport }}</div>
            </div>
            <div class="gauge">
              <div class="gLabel">Visits</div>
              <div class="gValue">{{ stats.nest }}</div>
            </div>
          </div>
        </header>

        <main class="shell" role="main">
          <div class="chat" ref="chatEl" aria-label="Conversation">
            <div class="datePill">Today</div>

            <div
              v-for="m in transcript"
              :key="m.id"
              class="row"
              :class="{ 'row--user': m.role === 'user', 'row--bot': m.role === 'bird' }"
            >
              <!-- Bird -->
              <template v-if="m.role === 'bird'">
                <div class="avatar" aria-hidden="true">
                  <img :src="magpieUrl" alt="" />
                </div>

                <div class="bubble bubble--bot">
                  <!-- Text -->
                  <div v-if="m.kind === 'text'" class="bubble__text">
                    {{ m.text }}
                  </div>

                  <!-- QR image message -->
                  <div v-else-if="m.kind === 'qr'" class="qrMsg">
                    <img :src="m.dataUrl" class="qrImgInline" :alt="m.alt || 'QR code'" />
                    <div class="qrHint">Scan to continue</div>
                  </div>

                  <div class="bubble__meta">{{ formatTime(m.ts) }}</div>
                </div>

                <div class="ghost" aria-hidden="true"></div>
              </template>

              <!-- User -->
              <template v-else>
                <div class="ghost" aria-hidden="true"></div>
                <div class="bubble bubble--user">
                  <div class="bubble__text">{{ m.text }}</div>
                  <div class="bubble__meta">{{ formatTime(m.ts) }}</div>
                </div>
                <div class="ghost" aria-hidden="true"></div>
              </template>
            </div>
          </div>

          <div class="choicesWrap">
            <div class="choices" aria-label="Reply options">
              <button
                v-for="(c, idx) in currentChoices"
                :key="idx"
                class="choiceBtn"
                type="button"
                @click="choose(idx)"
                :disabled="isDone || pending"
              >
                {{ c.label }}
              </button>
            </div>

            <div class="hint">
              Choose a reply to steer the conversation.
              <span v-if="pending"> · generating…</span>
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
import QRCode from "qrcode";
import magpieUrl from "../assets/magpie-off.png";

import { DISCUSSION_SCENARIOS, type Scenario } from "../services/scenarios";
import { computeLast24h, logEvent } from "../services/useCommunityStats";
import { logTelemetry, makeSessionId } from "../services/telemetry";

// ---------- Types ----------
type Role = "bird" | "user";

type Line =
  | { id: string; role: "bird"; kind: "text"; text: string; ts: number }
  | { id: string; role: "bird"; kind: "qr"; dataUrl: string; ts: number; alt?: string }
  | { id: string; role: "user"; text: string; ts: number };

// ---------- Env / QR target ----------
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://127.0.0.1:8000";
const TOTEM_ID = (import.meta.env.VITE_TOTEM_ID as string | undefined) ?? "TOTEM_001";

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

// ---------- State ----------
const router = useRouter();

const stageEl = ref<HTMLDivElement | null>(null);
const chatEl = ref<HTMLDivElement | null>(null);

const transcript = ref<Line[]>([]);
const pending = ref(false);

// Session (analytics)
const sessionId = ref<string>("");

// Pick scenario
const scenario = ref<Scenario>(
  DISCUSSION_SCENARIOS[Math.floor(Math.random() * DISCUSSION_SCENARIOS.length)] ??
    DISCUSSION_SCENARIOS[0]
);

const currentNodeId = ref(scenario.value.startId);

const flags = ref<Record<string, unknown>>({});
const lastProposedOfferId = ref<string | null>(null);

const stats = ref(computeLast24h());

// ---------- Computed ----------
const node = computed(() => scenario.value.nodes[currentNodeId.value] ?? null);
const currentText = computed(() => node.value?.text ?? "");
const currentChoices = computed(() => node.value?.choices ?? []);
const isDone = computed(
  () => currentNodeId.value.endsWith("_done") || currentText.value.trim() === ""
);

// ---------- Helpers ----------
function nowId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

async function scrollToBottom() {
  await nextTick();
  chatEl.value?.scrollTo({ top: chatEl.value.scrollHeight, behavior: "smooth" });
}

function pushBird(text: string) {
  if (!text.trim()) return;
  transcript.value.push({ id: nowId(), role: "bird", kind: "text", text, ts: Date.now() });
}

function pushBirdQr(dataUrl: string) {
  transcript.value.push({
    id: nowId(),
    role: "bird",
    kind: "qr",
    dataUrl,
    ts: Date.now(),
    alt: "QR code",
  });
}

function pushUser(text: string) {
  transcript.value.push({ id: nowId(), role: "user", text, ts: Date.now() });
}

function goBack() {
  router.push("/modes");
}

// ---------- 5A tracking ----------
function mark5A(tag?: string) {
  if (["ask", "advise", "assess", "assist", "arrange"].includes(tag ?? "")) {
    flags.value[tag as string] = true;
  }
}

function maybeComplete5A() {
  const ok =
    flags.value.ask &&
    flags.value.advise &&
    flags.value.assess &&
    flags.value.assist &&
    flags.value.arrange &&
    lastProposedOfferId.value;

  if (ok && !flags.value.fivea_done) {
    flags.value.fivea_done = true;
    logEvent({ type: "FIVEA_COMPLETED", scenarioId: scenario.value.id });
    stats.value = computeLast24h();
  }
}

// ---------- QR generation ----------
function buildQrTargetUrl() {
  const base = joinUrl(API_BASE, `/qr/${encodeURIComponent(TOTEM_ID)}`);
  const qs = new URLSearchParams({
    mode: "discussion",
    sid: sessionId.value,
  });
  return `${base}?${qs.toString()}`;
}

async function showQrAsBirdMessage() {
  pending.value = true;
  try {
    const url = buildQrTargetUrl();
    const dataUrl = await QRCode.toDataURL(url, { margin: 2, scale: 10 });
    pushBird("Here it is.");
    pushBirdQr(dataUrl);
  } finally {
    pending.value = false;
  }
}

// ---------- Effects ----------
function applyEffectsSync(effects?: any[]) {
  if (!effects) return;

  for (const ef of effects) {
    if (ef.type === "setFlag") flags.value[ef.key] = ef.value;

    if (ef.type === "proposeOffer") {
      lastProposedOfferId.value = ef.offerId;
      flags.value.assist = true;
      logEvent({ type: "OFFER_PROPOSED", offerId: ef.offerId, scenarioId: scenario.value.id });
      stats.value = computeLast24h();
    }

    if (ef.type === "completeSession") maybeComplete5A();
  }
}

async function applyEffectsAsync(effects?: any[]) {
  if (!effects) return;

  for (const ef of effects) {
    if (ef.type === "markQrIntent") {
      flags.value.arrange = true;
      logEvent({
        type: "QR_INTENT",
        offerId: ef.offerId ?? lastProposedOfferId.value ?? undefined,
        scenarioId: scenario.value.id,
      });
      stats.value = computeLast24h();
      await showQrAsBirdMessage();
      await scrollToBottom();
    }
  }
}

// ---------- Flow ----------
async function enterNode(id: string) {
  currentNodeId.value = id;
  const n = scenario.value.nodes[id];
  mark5A(n?.tag);
  pushBird(n?.text ?? "");
  await scrollToBottom();
  maybeComplete5A();
}

async function choose(idx: number) {
  if (pending.value) return;
  if (isDone.value) return goBack();

  const c = currentChoices.value[idx];
  if (!c) return;

  pushUser(c.label);
  await scrollToBottom();

  applyEffectsSync(c.effects);
  await enterNode(c.next);
  await applyEffectsAsync(c.effects);
}

// ---------- Stage scaling ----------
function applyStageScale() {
  if (!stageEl.value) return;
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  stageEl.value.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

// ---------- Lifecycle ----------
onMounted(async () => {
  applyStageScale();
  window.addEventListener("resize", applyStageScale);

  sessionId.value = makeSessionId();
  await logTelemetry("discussion", "VISIT", sessionId.value, {
    scenarioId: scenario.value.id,
  });

  logEvent({ type: "SESSION_START", scenarioId: scenario.value.id });
  stats.value = computeLast24h();

  pushBird(scenario.value.nodes[scenario.value.startId].text);
  await scrollToBottom();
});

onUnmounted(() => {
  window.removeEventListener("resize", applyStageScale);
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

/* Top bar */
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
}
.dot--green {
  background: #22c55e;
  box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.16);
}
.dot--orange {
  background: #f59e0b;
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.16);
}
.dot--red {
  background: #ef4444;
  box-shadow: 0 0 0 5px rgba(239, 68, 68, 0.16);
}

.topbar__right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.gauge {
  min-width: 110px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}
.gLabel {
  font-size: 12px;
  font-weight: 900;
  color: rgba(233, 238, 252, 0.65);
}
.gValue {
  font-size: 18px;
  font-weight: 950;
  color: rgba(233, 238, 252, 0.95);
}

/* Shell */
.shell {
  flex: 1;
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 0;
  padding: 22px;
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
  grid-template-columns: 64px 1fr 64px;
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

/* Bubbles */
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
  justify-self: end;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.24), rgba(56, 189, 248, 0.14));
  border-color: rgba(56, 189, 248, 0.20);
  color: rgba(255, 255, 255, 0.98);
}

.bubble__text {
  font-size: 22px;
  font-weight: 700;
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

/* QR message inside bubble */
.qrMsg {
  display: grid;
  gap: 10px;
  place-items: center;
  padding-top: 2px;
}

.qrImgInline {
  width: 280px;
  height: 280px;
  background: #fff;
  padding: 10px;
  border-radius: 18px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

.qrHint {
  font-size: 14px;
  font-weight: 900;
  opacity: 0.85;
}

/* Choices */
.choicesWrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.choiceBtn {
  height: 86px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(233, 238, 252, 0.95);
  font-size: 18px;
  font-weight: 900;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
}

.choiceBtn:hover {
  border-color: rgba(56, 189, 248, 0.28);
  background: rgba(56, 189, 248, 0.10);
}

.choiceBtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.hint {
  font-size: 14px;
  color: rgba(233, 238, 252, 0.64);
  padding: 0 8px;
}
</style>
