<template>
  <div class="screen">
    <div class="stageWrap">
      <div class="stage" aria-label="QR Page (1920x1080)">
        <div class="layout">
          <!-- LEFT: magpie -->
          <img :src="magpiePng" class="magpie" alt="Magpie" />

          <!-- RIGHT: bubble + QR (QR OUTSIDE bubble) -->
          <div class="right">
            <div class="bubble">
              <div class="bubbleTitle">Continue the full experience</div>
              <div class="bubbleSubtitle">
                Scan the QR code to continue this conversation on our Smokwit website.
              </div>
            </div>

            <div class="qrCard">
              <img v-if="qrDataUrl" :src="qrDataUrl" class="qrImg" alt="QR code" />
              <div v-else class="qrLoading">Generating QR…</div>
              <div class="hint">Scan to continue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import QRCode from "qrcode";
import magpiePng from "../assets/magpie-off.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const TOTEM_ID = import.meta.env.VITE_TOTEM_ID ?? "TOTEM_001";

function buildUrl(base: string, path: string) {
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}


const targetUrl = buildUrl(API_BASE_URL, `/qr/${encodeURIComponent(TOTEM_ID)}`);

const qrDataUrl = ref<string>("");

onMounted(async () => {
  qrDataUrl.value = await QRCode.toDataURL(targetUrl, { margin: 2, scale: 10 });
});
</script>


<style scoped>
/* Fullscreen black */
.screen {
  width: 100%;
  height: 100%;
  background: #0b0b0c;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
}


.stageWrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* Fixed 1920×1080 canvas */
.stage {
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
}


/* ===== Layout inside stage (SHIFTED LEFT) ===== */
.layout {
  position: absolute;
  inset: 0;

  display: grid;
  grid-template-columns: 560px 1fr; /* wider magpie column */
  align-items: center;
  gap: 70px;

  /* moved left (less right padding) */
  padding-left: 90px;
  padding-right: 40px;
}

/* Magpie: bigger + fully visible */
.magpie {
  width: 600px; /* bigger */
  height: auto;
  justify-self: start;
  align-self: center;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
  transform: translateY(-120px);
}

/* Right side stack (narrower so it never overflows) */
.right {
  width: 100%;
  max-width: 880px;
  justify-self: start;
  display: grid;
  gap: 34px;
}

/* Bubble: text only */
.bubble {
  position: relative;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 46px;
  padding: 54px 60px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);

  /* tiny pull left to avoid clipping */
  margin-left: -20px;
  transform: translateY(50px);
}

/* Tail points to magpie (LEFT) */
.bubble::after {
  content: "";
  position: absolute;
  left: -52px;
  top: 54%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-right: 64px solid rgba(255, 255, 255, 0.96);
  border-top: 34px solid transparent;
  border-bottom: 34px solid transparent;
}

.bubbleTitle {
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 900;
  font-size: 56px;
  color: #111;
  margin-bottom: 12px;
}

.bubbleSubtitle {
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 700;
  font-size: 28px;
  line-height: 1.25;
  color: rgba(0, 0, 0, 0.75);
}

/* QR OUTSIDE bubble */
.qrCard {
  width: 520px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);

  display: grid;
  place-items: center;
  justify-self: center;
  transform : translateY(70px)
}

.qrImg {
  width: 360px;
  height: 360px;
  background: #fff;
  padding: 14px;
  border-radius: 22px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

.qrLoading {
  width: 360px;
  height: 360px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.22);
  display: grid;
  place-items: center;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
}

.hint {
  margin-top: 14px;
  text-align: center;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
}
</style>
