<template>
  <div class="screen">
    <div class="stageWrap">
      <div class="stage" aria-label="QR Page Stage">

        <div class="layout">
          <!-- TOP (portrait): magpie -->
          <img :src="magpiePng" class="magpie" alt="Magpie" />

          <!-- Middle: bubble -->
          <div class="bubble">
            <div class="bubbleTitle">Continue the full experience</div>
            <div class="bubbleSubtitle">
              Scan the QR code to continue on our Smokwit website.
            </div>
          </div>

          <!-- Bottom: QR -->
          <div class="qrCard" aria-label="QR Code Card">
            <img v-if="qrDataUrl" :src="qrDataUrl" class="qrImg" alt="QR code" />
            <div v-else class="qrLoading">Generating QR…</div>
            <div class="hint">Scan to continue</div>
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

function buildUrl(base: string, path: string): string {
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

const targetUrl = buildUrl(API_BASE_URL, `/qr/${encodeURIComponent(TOTEM_ID)}`);
const qrDataUrl = ref<string>("");

onMounted(async () => {
  qrDataUrl.value = await QRCode.toDataURL(targetUrl, {
    margin: 2,
    scale: 10,
  });
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

/* Stage uses global vars (portrait default) */
.stage {
  width: var(--stage-w);
  height: var(--stage-h);
  position: relative;
  overflow: hidden;
}

/*
  PORTRAIT-FIRST layout:
  - magpie (top)
  - bubble (middle)
  - QR (bottom)
*/
.layout {
  position: absolute;
  inset: 0;

  display: grid;
  grid-template-rows: auto auto 1fr;
  justify-items: center;
  align-items: start;

  padding: 120px 70px 90px;
  gap: 44px;
}

.magpie {
  width: 520px;
  height: auto;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
}

.bubble {
  width: 920px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 44px;
  padding: 52px 56px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  text-align: center;
}

.bubbleTitle {
  font-weight: 900;
  font-size: 60px;
  color: #111;
  margin-bottom: 14px;
}

.bubbleSubtitle {
  font-weight: 700;
  font-size: 30px;
  line-height: 1.25;
  color: rgba(0, 0, 0, 0.75);
}

.qrCard {
  width: 640px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);

  display: grid;
  place-items: center;
  align-self: start;
}

.qrImg {
  width: 440px;
  height: 440px;
  background: #fff;
  padding: 14px;
  border-radius: 22px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

.qrLoading {
  width: 440px;
  height: 440px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.22);
  display: grid;
  place-items: center;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
}

.hint {
  margin-top: 14px;
  text-align: center;
  font-weight: 800;
  font-size: 26px;
  color: rgba(255, 255, 255, 0.9);
}

/*
  LANDSCAPE enhancement:
  - magpie left
  - bubble + QR right
  Keeps it usable if a screen ends up landscape.
*/
@media (orientation: landscape) {
  .layout {
    grid-template-rows: 1fr;
    grid-template-columns: 560px 1fr;
    align-items: center;
    justify-items: start;

    padding: 90px 60px;
    gap: 70px;
  }

  .magpie {
    width: 600px;
    justify-self: start;
  }

  .bubble {
    width: 880px;
    text-align: left;
  }

  .qrCard {
    width: 520px;
    justify-self: center;
  }

  .qrImg,
  .qrLoading {
    width: 360px;
    height: 360px;
  }

  .bubbleTitle {
    font-size: 56px;
  }

  .bubbleSubtitle {
    font-size: 28px;
  }
}
</style>
