<template>
  <div class="dStep">
    <div class="dTop">
      <div class="dCluster">
        <div class="magpieWrap">
          <img class="magpieImg" :src="magpieSrc" alt="Magpie" />
        </div>

        <div class="dBubble qrBubble">
          <div class="mainText">
            I did try this one and it is really helpful! Give it a try!
          </div>

          <div class="explain">
            Scan the QR-Code below and engage with your personal agent
          </div>

          <div class="qrCard">
            <QrDisplay :agent="agent" :offer-filter="offerFilter" />
          </div>
        </div>
      </div>
    </div>

    <div class="dActions">
      <button class="dBtn dBtn--blue" @click="emit('done')">Thanks mate!</button>
      <button class="dBtn dBtn--blue" @click="emit('done')">See you around!</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import QrDisplay from "@/features/discussion/components/QrDisplay.vue";
import { magpieSrc } from "@/shared/state/communityUi";

defineProps<{
  agent: "expert" | "smoker" | "future";
  offerFilter?: string | null;
}>();

const emit = defineEmits<{ (e: "done"): void }>();
</script>

<style scoped>
.dStep {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: var(--pad-top) var(--pad-x) var(--pad-bottom);
  gap: 18px;
  color: #fff;
}

.dTop {
  display: grid;
  justify-items: center;
  align-content: start;
  padding-top: var(--cluster-top-offset);
  gap: 18px;
}

.dCluster {
  display: grid;
  grid-template-columns: var(--magpie-size) minmax(520px, var(--bubble-max-width));
  gap: var(--cluster-gap);
  align-items: center;
  width: min(100%, var(--cluster-max-width));
  justify-content: center;
}

.magpieWrap {
  width: var(--magpie-size);
  height: var(--magpie-size);
  display: grid;
  place-items: center;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
}

.magpieImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dBubble {
  width: 100%;
  max-width: var(--bubble-max-width);
  border-radius: var(--bubble-radius);
  padding: var(--bubble-pad);
  background: var(--bubble-bg);
  outline: var(--bubble-outline);
  box-shadow: var(--bubble-shadow);
  color: #fff;
  text-align: left;
  overflow: hidden;
}

.qrBubble {
  max-width: 980px;
}

.mainText {
  font-weight: 950;
  font-size: var(--main-text-size);
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.explain {
  margin-top: 10px;
  opacity: 0.85;
  font-size: var(--meta-text-size);
  overflow-wrap: anywhere;
}

.qrCard {
  margin: 18px auto 0;
  width: 360px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: #111;
}

.dActions {
  display: grid;
  gap: var(--btn-gap);
  margin-bottom: var(--actions-bottom-space);
  justify-items: center;
}

.dBtn {
  width: min(100%, var(--btn-max-width));
  border: none;
  border-radius: var(--btn-radius);
  padding: var(--btn-pad-y) var(--btn-pad-x);
  font-size: var(--btn-font);
  font-weight: 950;
  cursor: pointer;
  color: #fff;
}

.dBtn--blue {
  background: rgba(60, 120, 220, 0.72);
}
</style>
