<template>
  <div class="screen">
    <div class="stageWrap">
      <div class="stage" aria-label="A1 - Demander">
        <div class="layout">
          <!-- TOP: HUD -->
          <div class="topHud">
            <!-- DEBUG LED (top-left) -->
            <div class="ledDebug">LED {{ ledLabel }}</div>

            <!-- Gauges HUD (top-right) -->
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
          </div>

          <!-- CENTER: bird + bubble -->
          <div class="cluster" aria-label="Oiseau + bulle">
            <img :src="magpieSrc" class="magpie" alt="Magpie" />

            <div class="bubble" aria-label="Bulle">
              <div class="bubbleText">{{ line }}</div>
            </div>
          </div>

          <!-- BOTTOM: 2 buttons (same next screen) -->
          <div class="actions" aria-label="Choix">
            <button class="btn" type="button" @click="goNext('scale')">
              Tu dirais que tu fumes peu, moyen ou beaucoup ?
            </button>

            <button class="btn" type="button" @click="goNext('count')">
              Tu veux me dire à peu près combien par jour ?
            </button>
          </div>

          <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import magpieGreen from "../../assets/magpie_green.png";
import magpieOrange from "../../assets/magpie_orange.png";
import magpieRed from "../../assets/magpie_red.png";

// ✅ shared state
import { ledState, ledLabel, gauges } from "../../state/community";

type AskStyle = "scale" | "count";

const router = useRouter();
const errorMsg = ref<string | null>(null);

const variants = [
  "Bon… je fume. Mais pas TANT que ça… je crois.",
  "Disons que j’ai une relation stable avec mon paquet. Trop stable.",
  "J’allume souvent… enfin, trop souvent pour mes petites plumes.",
] as const;

const line = computed(() => variants[Math.floor(Math.random() * variants.length)]);

const magpieSrc = computed(() => {
  if (ledState.value === "green") return magpieGreen;
  if (ledState.value === "orange") return magpieOrange;
  return magpieRed;
});

function goNext(askStyle: AskStyle): void {
  // ✅ même écran suivant, on garde juste l’info pour plus tard
  router.push({ path: "/discussion/1b", query: { ask: askStyle } });
}

onMounted(() => {
  // Ne rien reset ici. Si tu testes encore, tu le fais dans Ecran_0 ou App.vue.
  errorMsg.value = null;
});
</script>

<style scoped>
/* Base stage */
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
.stage {
  width: var(--stage-w);
  height: var(--stage-h);
  position: relative;
  overflow: hidden;
}

/* Layout */
.layout {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  padding: 70px 90px 160px;
  row-gap: 55px;
}

/* TOP HUD */
.topHud {
  position: relative;
  height: 80px; /* juste pour réserver l’espace */
}

/* LED debug */
.ledDebug {
  position: absolute;
  top: 0;
  left: 0;
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

/* Gauges HUD */
.gaugesHud {
  position: absolute;
  top: 0;
  right: 0;
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

/* Center cluster */
.cluster {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.magpie {
  width: 500px;
  height: auto;
  display: block;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
  transform: translateY(-10px);
  transform: translateX(-40px)
}

.bubble {
  width: 420px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 34px;
  padding: 22px 22px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  color: #111;
  text-align: center;
  position: relative;
  transform: translateY(-40px);
  transform: translateX(-40px);
}

.bubble::before {
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

.bubbleText {
  font-weight: 900;
  font-size: 36px;
  line-height: 1.2;
  color: rgba(0, 0, 0, 0.82);
}

/* Actions */
.actions {
  display: grid;
  justify-items: center;
  gap: 60px;
  transform: translateY(-20px);
}

.btn {
  width: 860px;
  max-width: 100%;
  border: none;
  border-radius: 22px;
  padding: 28px 26px;
  background: #1b57b9;
  color: white;
  font-weight: 900;
  font-size: 30px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.40);
  cursor: pointer;
  transition: transform 120ms ease;
}
.btn:active {
  transform: scale(0.99);
}

.error {
  justify-self: center;
  background: rgba(198, 22, 10, 0.15);
  border: 1px solid rgba(198, 22, 10, 0.35);
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 14px;
  border-radius: 14px;
  font-weight: 650;
  font-size: 16px;
}
</style>
