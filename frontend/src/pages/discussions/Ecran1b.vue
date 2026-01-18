<template>
  <div class="screen">
    <div class="stageWrap">
      <div class="stage" aria-label="A1b - Niveau de consommation">
        <div class="layout">
          <!-- TOP AREA -->
          <div class="topArea">
            <!-- ✅ Shared HUD (top-left debug + top-right gauges) -->
            <HudCommunity :gauges="gauges" :led-label="ledLabel" :show-led-debug="true" />

            <!-- Center cluster -->
            <div class="cluster" aria-label="Oiseau + bulle">
              <img :src="magpieSrc" class="magpie" alt="Magpie" />

              <div class="bubble" aria-label="Bulle">
                <div class="bubbleText">{{ bubbleText }}</div>
              </div>
            </div>
          </div>

          <!-- BOTTOM -->
          <div class="actions" aria-label="Choix">
            <!-- 3 choices -->
            <template v-if="picked === null">
              <button class="btn choice blue" type="button" @click="pick('low')">
                Plutôt peu
              </button>

              <button class="btn choice blue" type="button" @click="pick('mid')">
                Moyen
              </button>

              <button class="btn choice blue" type="button" @click="pick('high')">
                Beaucoup
              </button>
            </template>

            <!-- Continue after choice -->
            <template v-else>
              <button class="btn choice red" type="button" @click="continueFlow">
                Continuer
              </button>
            </template>

            <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import HudCommunity from "../../components/HudCOmmunity.vue";
import { gauges, ledLabel, magpieSrc, bumpRespiration } from "../../state/community";

type Level = "low" | "mid" | "high";

const router = useRouter();
const errorMsg = ref<string | null>(null);
const picked = ref<Level | null>(null);

const introVariants = [
  "OK… plutôt peu, moyen ou beaucoup ?",
  "Alors… tu dirais plutôt quel niveau ?",
  "Dis-moi… c’est petit nuage, nuage moyen, ou gros nuage ?",
] as const;

const reactions: Record<Level, readonly string[]> = {
  low: [
    "OK, petit nuage. Mais nuage quand même.",
    "Même les petits nuages finissent par piquer les yeux.",
  ],
  mid: [
    "Nuage moyen… mais je tousse en taille XXL.",
    "Mi-figue mi-clope. On peut mieux faire.",
  ],
  high: [
    "Gros nuage. On dirait un barbecue permanent.",
    "On est plus proche du volcan que de la brume légère.",
  ],
};

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const intro = pickOne(introVariants);

const bubbleText = computed(() => {
  if (picked.value === null) return intro;
  return pickOne(reactions[picked.value]);
});

function pick(level: Level): void {
  if (picked.value !== null) return;
  picked.value = level;

  // ✅ petite augmentation "Respiration" dès que cet écran est validé
  bumpRespiration(6);
}

function continueFlow(): void {
  if (picked.value === null) return;

  // ✅ prochain écran (change la route quand tu crées Ecran2)
  router.push({ path: "/discussion/2", query: { level: picked.value } });
}
</script>>


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

/* Layout: top + bottom */
.layout {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 90px 70px 160px;
  row-gap: 44px;
}

/* TOP */
.topArea {
  position: relative;
  height: 100%;
  display: grid;
  place-items: center;
  padding-top: 170px;
}

/* LED debug */
.ledDebug {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  padding: 10px 14px;
}

/* Gauges HUD */
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

/* Cluster */
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
  transform: translateY(-20px);
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
  transform: translateY(-110px);
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
  font-size: 34px;
  line-height: 1.2;
  color: rgba(0, 0, 0, 0.82);
}

/* Bottom actions */
.actions {
  display: grid;
  justify-items: center;
  gap: 60px;
  transform: translateY(-40px);
}

.btn {
  width: 820px;
  max-width: 100%;
  border: none;
  border-radius: 22px;
  padding: 32px 22px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 120ms ease;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.40);
}
.btn:active {
  transform: scale(0.99);
}

.choice {
  color: #fff;
  font-size: 40px;
}
.choice.blue {
  background: #1b57b9;
}
.choice.red {
  background: #b5120a;
}

.error {
  background: rgba(198, 22, 10, 0.15);
  border: 1px solid rgba(198, 22, 10, 0.35);
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 14px;
  border-radius: 14px;
  font-weight: 650;
  font-size: 16px;
}
</style>
