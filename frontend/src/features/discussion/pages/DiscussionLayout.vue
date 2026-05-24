<template>
  <div class="discussionRoot">
    <HudCommunity :gauges="gauges" :led-label="ledLabel" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import HudCommunity from "@/shared/components/HudCommunity.vue";
import { gauges, ledLabel, recomputeGauges, stats } from "@/shared/state/community";
import { getCommunityStats } from "@/shared/services/api";

let pollTimer: ReturnType<typeof setInterval> | null = null;

async function refreshCommunityStats() {
  try {
    const s = await getCommunityStats();
    stats.value = { ...s };
    recomputeGauges();
  } catch {
    /* keep current HUD if the API is unreachable */
  }
}

onMounted(() => {
  void refreshCommunityStats();
  pollTimer = setInterval(() => void refreshCommunityStats(), 30_000);
});

onUnmounted(() => {
  if (pollTimer != null) clearInterval(pollTimer);
});
</script>

<style>
/* NOT scoped on purpose: it styles the step components (slot) */
.discussionRoot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;

  background: #0b0b0c;
  color: rgba(255, 255, 255, 0.92);

  /* knobs */
  --pad-x: 70px;
  --pad-top: 90px;
  --pad-bottom: 160px;
  --center-top: 170px;

  --cluster-gap: 44px;
  --magpie-size: 320px;
  --cluster-max-width: 1120px;
  --cluster-top-offset: 280px;

  --bubble-max-width: 760px;
  --bubble-pad: 34px;
  --bubble-radius: 28px;
  --bubble-bg: rgba(255, 255, 255, 0.06);
  --bubble-outline: 2px solid rgba(255, 255, 255, 0.10);
  --bubble-shadow: 0 28px 80px rgba(0, 0, 0, 0.55);

  --main-text-size: 30px;
  --explain-text-size: 35px;
  --meta-text-size: 26px;

  --btn-max-width: 920px;
  --btn-gap: 16px;
  --btn-radius: 18px;
  --btn-font: 30px;
  --btn-pad-y: 22px;
  --btn-pad-x: 26px;
  --actions-bottom-space: 240px;
}

/* shared step layout helpers */
.discussionRoot .dStep {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: var(--pad-top) var(--pad-x) var(--pad-bottom);
  row-gap: 44px;
  box-sizing: border-box;
}

.discussionRoot .dTop {
  position: relative;
  height: 100%;
  display: grid;
  place-items: center;
  padding-top: var(--cluster-top-offset);
  box-sizing: border-box;
}

.discussionRoot .dCluster {
  display: grid;
  grid-template-columns: var(--magpie-size) minmax(520px, var(--bubble-max-width));
  justify-content: center;
  align-items: center;
  gap: var(--cluster-gap);
  width: min(100%, var(--cluster-max-width));
}

.discussionRoot .dMagpie,
.discussionRoot .magpieImg {
  width: var(--magpie-size);
  height: var(--magpie-size);
  object-fit: contain;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
}

.discussionRoot .dBubble {
  width: 100%;
  max-width: var(--bubble-max-width);
  background: var(--bubble-bg);
  border-radius: var(--bubble-radius);
  padding: var(--bubble-pad);
  box-shadow: var(--bubble-shadow);
  color: #fff;
  outline: var(--bubble-outline);
  overflow: hidden;
}

.discussionRoot .dActions {
  display: grid;
  justify-items: center;
  gap: var(--btn-gap);
  margin-bottom: var(--actions-bottom-space);
}

.discussionRoot .dBtn {
  width: min(100%, var(--btn-max-width));
  border: none;
  border-radius: var(--btn-radius);
  padding: var(--btn-pad-y) var(--btn-pad-x);
  font-weight: 900;
  font-size: var(--btn-font);
  color: #fff;
  cursor: pointer;
  transition: transform 120ms ease;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.4);
}
.discussionRoot .dBtn:active { transform: scale(0.99); }
.discussionRoot .dBtn--red { background: #b5120a; }
.discussionRoot .dBtn--blue { background: #1b57b9; }
</style>
