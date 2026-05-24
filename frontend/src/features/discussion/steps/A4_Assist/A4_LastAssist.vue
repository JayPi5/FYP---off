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
          <QrDisplay :offer-filter="offerFilter" />
        </div>
      </div>

      <div class="explainOutside">Scan to open the resource you picked</div>
    </div>

    <div class="actions">
      <button class="btn btn--blue" @click="emit('next')">You should try it yourself!</button>
      <button class="btn btn--blue" @click="emit('next')">Yes, I'll have a try, thanks!</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import QrDisplay from "@/features/discussion/components/QrDisplay.vue";
import { magpieSrc } from "@/shared/state/communityUi";

defineProps<{ offerFilter?: string | null }>();

const emit = defineEmits<{ (e: "next"): void }>();
</script>

<style scoped>
.dStep {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 190px 64px 80px;
  color: #fff;
}

.top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

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

.bubble {
  width: min(680px, 92vw);
  border-radius: 26px;
  padding: 22px 22px 18px;
  background: rgba(255, 255, 255, 0.06);
  outline: 2px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55);
  overflow: hidden;
  margin-top: 160px;
}

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

.qrWrap {
  width: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.explainOutside {
  text-align: center;
  font-size: 22px;
  font-weight: 900;
  opacity: 0.92;
  margin-top: 40px;
}

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
