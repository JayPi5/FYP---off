<template>
  <div class="screen">
    <div class="stageWrap">
      <div class="stage" aria-label="Ecran 0 - Accueil">
        <div class="layout">
          <!-- TOP AREA -->
          <div class="topArea">
            <!-- ✅ Shared HUD (top-left debug + top-right gauges) -->
            <HudCommunity :gauges="gauges" :led-label="ledLabel" :show-led-debug="true" />

            <!-- Center cluster -->
            <div class="cluster" aria-label="Oiseau + bulle">
              <img :src="magpieSrc" class="magpie" alt="Magpie" />

              <div class="bubble" aria-label="Bulle">
                <div class="bubbleTitle">{{ bubble.title }}</div>
                <div class="bubbleText">{{ bubble.text }}</div>
              </div>
            </div>
          </div>

          <!-- BOTTOM: 2 equal choices -->
          <div class="bottomActions" aria-label="Actions">
            <button class="btn choice red" type="button" @click="goFull5A">
              OK, raconte-moi tes bêtises avec la clope
            </button>

            <button
              v-if="ledState === 'red'"
              class="btn choice blue"
              type="button"
              @click="goQuickHelp"
            >
              On fait un check-up de plumes.
            </button>

            <button
              v-else-if="ledState === 'orange'"
              class="btn choice blue"
              type="button"
              @click="goMidHelp"
            >
              Petit coup de pouce rapide
            </button>

            <button
              v-else
              class="btn choice blue"
              type="button"
              @click="goMiniChallenge"
            >
              Petit défi rapide
            </button>

            <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
          </div>
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


import HudCommunity from "../../components/HudCOmmunity.vue";
import { gauges, ledLabel, ledState, seedDemoValues } from "../../state/community";

type Bubble = { title: string; text: string };

const router = useRouter();
const errorMsg = ref<string | null>(null);

const magpieSrc = computed(() => {
  if (ledState.value === "green") return magpieGreen;
  if (ledState.value === "orange") return magpieOrange;
  return magpieRed;
});

const bubbles = {
  red: [
    { title: "Aïe…", text: "Là je suis en mode fumée maximale. Tu m’aides ?" },
    { title: "Oups…", text: "Je crois que je fais trop de fumée. On fait un vrai check-up ?" },
    { title: "Alerte.", text: "J’ai besoin d’un vrai coup de main, pas juste un petit truc." },
  ],
  orange: [
    { title: "Hmm…", text: "Je suis un peu inquiet. Tu me donnes un coup de main ?" },
    { title: "Ça va moyen.", text: "On peut faire mieux ensemble. Tu m’aides ?" },
    { title: "On continue ?", text: "Un petit effort et je repasse en forme !" },
  ],
  green: [
    { title: "Plumes au vert !", text: "Merci… la communauté m’a bien aidé. On continue ?" },
    { title: "Ça va mieux.", text: "On garde le rythme ? Petit défi ou vrai check-up ?" },
    { title: "Merci !", text: "Tu peux encore m’aider, ou proposer une vraie aide." },
  ],
} satisfies Record<"red" | "orange" | "green", Bubble[]>;

const fallbackBubble: Bubble = { title: "Salut !", text: "Tu m’aides ?" };

function pickOne<T>(arr: readonly T[], fallback: T): T {
  if (!arr.length) return fallback;
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const bubble = computed<Bubble>(() => pickOne(bubbles[ledState.value], fallbackBubble));

onMounted(() => {
  errorMsg.value = null;
  try {
    seedDemoValues("green");
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "Erreur de chargement.";
  }
});

function goFull5A(): void {
  router.push({ path: "/discussion/1", query: { entry: "full" } });
}
function goQuickHelp(): void {
  router.push({ path: "/discussion/1", query: { entry: "quick" } });
}
function goMidHelp(): void {
  router.push({ path: "/discussion/1", query: { entry: "mid" } });
}
function goMiniChallenge(): void {
  router.push({ path: "/discussion/1", query: { entry: "mini" } });
}

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

/* Layout: top + bottom */
.layout {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 90px 70px 160px;
  row-gap: 44px;
}

/* TOP: cluster centered */
.topArea {
  position: relative;
  height: 100%;
  display: grid;
  place-items: center;
  padding-top: 170px;
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
  transform: translateY(-50px);
}

/* Bubble */
.bubble {
  width: 400px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 34px;
  padding: 30px 34px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  color: #111;
  text-align: center;
  position: relative;
  transform: translateY(-140px);
}

/* Tail */
.bubble::before {
  content: "";
  position: absolute;
  left: -18px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 14px solid transparent;
  border-bottom: 14px solid transparent;
  border-right: 18px solid rgba(255, 255, 255, 0.96);
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.25));
}

.bubbleTitle {
  font-weight: 900;
  font-size: 50px;
  margin-bottom: 10px;
}
.bubbleText {
  font-weight: 800;
  font-size: 33px;
  line-height: 1.25;
  color: rgba(0, 0, 0, 0.75);
}

/* Bottom actions */
.bottomActions {
  display: grid;
  justify-items: center;
  gap: 60px;
  transform: translateY(-40px);
}

/* Buttons base (equal) */
.btn {
  width: 820px;
  max-width: 100%;
  border: none;
  border-radius: 22px;
  padding: 22px 22px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 120ms ease;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.40);
}
.btn:active {
  transform: scale(0.99);
}

/* Equal choice style */
.choice {
  color: #fff;
  font-size: 30px;
}

/* Colors */
.choice.red {
  background: #b5120a;
}
.choice.blue {
  background: #1b57b9;
}

/* Error */
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
