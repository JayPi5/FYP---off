<template>
  <div class="dStep">
    <div class="top">
      <div class="magpieWrap">
        <img class="magpieImg" :src="magpieSrc" alt="Magpie" />
      </div>

      <div class="bubble">
        <div class="mainText">
          Hum... intersting I didn't know. Out of curiosity I saw that there are many offers and most of them are free!
          I also heard something about an AI coach developed by HEG Arc and UniNE...
        </div>

        <div class="qrWrap">
          <QrPlaceholder label="Smokwit App" />
        </div>
      </div>

      <div class="explainOutside">QR Code to Smokwit App</div>
    </div>

    <div class="actions">
      <button class="btn btn--blue" @click="emit('next')">You should try it yourself!</button>
      <button class="btn btn--blue" @click="emit('next')">Yes, I'll have a try, thanks!</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { magpieSrc } from "../../../../state/communityUi";
import QrPlaceholder from "../shared/QrPlaceHolder.vue";

const emit = defineEmits<{ (e: "next"): void }>();
</script>

<style scoped>
/* ✅ IMPORTANT: bigger top padding so HUD never overlaps the bubble */
.dStep {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 190px 64px 80px; /* was 110 -> now safe under HUD */
  color: #fff;
}

.top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

/* slightly smaller magpie so everything fits */
.magpieWrap {
  width: 280px;
  height: 280px;
  display: grid;
  place-items: center;
}
.magpieImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
}

/* smaller + centered bubble */
.bubble {
  width: min(680px, 92vw);
  border-radius: 26px;
  padding: 22px 22px 18px;
  background: rgba(255, 255, 255, 0.06);
  outline: 2px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55);
  overflow: hidden; /* no overflow ever */
  margin-top: 160px;
}

/* ✅ text: smaller + tighter + forced wrap */
.mainText {
  font-weight: 950;
  font-size: 28px;
  line-height: 1.25;
  text-align: center;
  overflow-wrap: anywhere;
  word-break: break-word;
  max-width: 620px;
  margin: 0 auto 14px;
}

/* QR constrained */
.qrWrap {
  width: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
}

/* force the placeholder to stay inside bubble */
.qrWrap :deep(*) {
  width: 300px;
  max-width: 300px;
}

/* explanation outside bubble */
.explainOutside {
  text-align: center;
  font-size: 22px;
  font-weight: 900;
  opacity: 0.92;
  margin-top: 40px;
}

/* buttons higher */
.actions {
  display: grid;
  gap: 40px;
  margin-bottom: 110px;
  padding: 0 20px;
  justify-items: center;
}

.btn {
  width: min(900px, 92vw);
  border: none;
  border-radius: 18px;
  padding: 22px 26px;
  font-size: 30px;
  font-weight: 950;
  cursor: pointer;
  color: #fff;
}

.btn--blue {
  background: rgba(60, 120, 220, 0.72);
}
</style>
