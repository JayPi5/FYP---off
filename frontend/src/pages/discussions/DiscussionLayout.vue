<template>
  <div class="discussionRoot">
    <HudCommunity :gauges="gauges" :led-label="ledLabel" :show-led-debug="true" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import HudCommunity from "../../components/HudCommunity.vue";
import { gauges, ledLabel, recomputeGauges, stats } from "../../state/community";
import { getCommunityStats } from "../../services/api";

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

  --cluster-gap: 28px;
  --magpie-w: 500px;

  --bubble-w: 420px;
  --bubble-pad-y: 22px;
  --bubble-pad-x: 22px;
  --bubble-radius: 34px;

  --btn-w: 820px;
  --btn-gap: 60px;
  --btn-radius: 22px;
  --btn-font: 34px;
  --btn-pad-y: 32px;
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
  padding-top: var(--center-top);
  box-sizing: border-box;
}

.discussionRoot .dCluster {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--cluster-gap);
}

.discussionRoot .dMagpie {
  width: var(--magpie-w);
  height: auto;
  display: block;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
}

.discussionRoot .dBubble {
  width: var(--bubble-w);
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--bubble-radius);
  padding: var(--bubble-pad-y) var(--bubble-pad-x);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  color: #111;
  text-align: center;
  position: relative;
}

.discussionRoot .dBubble::before {
  content: "";
  position: absolute;
  left: -18px;
  top: 52%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 14px solid transparent;
  border-bottom: 14px solid transparent;
  border-right: 18px solid rgba(255, 255, 255, 0.96);
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.25));
}

.discussionRoot .dActions {
  display: grid;
  justify-items: center;
  gap: var(--btn-gap);
}

.discussionRoot .dBtn {
  width: var(--btn-w);
  max-width: 100%;
  border: none;
  border-radius: var(--btn-radius);
  padding: var(--btn-pad-y) 22px;
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
