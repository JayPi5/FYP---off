<template>
  <!-- DEBUG LED (top-left) -->
  <div v-if="showLedDebug" class="ledDebug">LED {{ ledLabel }}</div>

  <!-- Gauges HUD (top-right, no box) -->
  <div class="gaugesHud" aria-label="Etat communautaire">
    <div class="gLine" aria-label="Respiration">
      <div class="gIcon">🫁</div>
      <div class="gBar">
        <div class="gFill" :style="{ width: gauges.respiration + '%' }" />
      </div>
      <div class="gPct">{{ gauges.respiration }}%</div>
    </div>

    <div class="gLine" aria-label="Soutien humain">
      <div class="gIcon">❤️</div>
      <div class="gBar">
        <div class="gFill" :style="{ width: gauges.support + '%' }" />
      </div>
      <div class="gPct">{{ gauges.support }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  gauges: { respiration: number; support: number };
  ledLabel: string;
  showLedDebug?: boolean;
}>();
</script>

<style scoped>
/* Gauges HUD: 2 lines on the right (no box) */
.gaugesHud {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;

  display: grid;
  gap: 25px;
}

.gLine {
  display: grid;
  grid-template-columns: 28px 210px 70px;
  gap: 20px;
  align-items: center;
}

.gIcon {
  font-size: 30px;
  opacity: 0.95;
  display: grid;
  place-items: center;
}

.gBar {
  height: 15px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
}

.gFill {
  height: 100%;
  border-radius: 999px;
  background: rgba(122, 162, 255, 0.95);
}

.gPct {
  font-weight: 900;
  font-size: 28px;
  text-align: right;
  color: rgba(255, 255, 255, 0.92);
}

/* Debug label top-left */
.ledDebug {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;

  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.92);

  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  padding: 10px 14px;
}
</style>
