<template>
  <div class="screen">
    <div class="stageWrap">
      <div class="stage" aria-label="A2 - Conseiller">
        <div class="layout">
          
          <div class="topArea">
           
            <HudCommunity :gauges="gauges" :led-label="ledLabel" :show-led-debug="true" />

           
            <div class="cluster" aria-label="Oiseau + bulle">
              <img :src="magpieSrc" class="magpie" alt="Magpie" />

              <div class="bubble" aria-label="Bulle">
                <div class="bubbleText">{{ bubbleText }}</div>
              </div>
            </div>
          </div>

          
          <div class="actions" aria-label="Conseils">
            

            
            <template v-if="picked === null">
              <button class="btn choice blue" type="button" @click="pick('health')">
                Arrêter serait vraiment bon pour ta santé et ton souffle.
              </button>

              <button class="btn choice blue" type="button" @click="pick('progressive')">
                On peut aussi commencer par réduire, c’est déjà un bon pas.
              </button>

              <button class="btn choice blue" type="button" @click="pick('autonomy')">
                C’est toi qui décides, moi je suis là pour t’aider à choisir.
              </button>
            </template>

            
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

type AdviceStyle = "health" | "progressive" | "autonomy";

const router = useRouter();
const errorMsg = ref<string | null>(null);
const picked = ref<AdviceStyle | null>(null);

// Bulle initiale (avant choix)
const introVariants = [
  "Et si j’arrête, je deviens quoi ? Un oiseau ennuyeux ?",
  "Si je lâche la clope, je perds mon style de rebelle enfumé ?",
  "J’ai peur de devenir un oiseau… sérieux.",
] as const;

// Réactions selon bouton
const reactions: Record<AdviceStyle, readonly string[]> = {
  health: [
    "Respirer sans siffler, ça me fait rêver.",
    "OK, j’avoue, grimper les escaliers sans râler, ça me tente.",
  ],
  progressive: [
    "Commencer par réduire, ça me rassure. Je n’aime pas les sauts dans le vide.",
    "Un petit pas pour l’oiseau, un grand pas pour ses poumons.",
  ],
  autonomy: [
    "Merci, j’aime bien qu’on me laisse le volant.",
    "Ouf, pas de morale, juste un copilote. Ça me va.",
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

function pick(style: AdviceStyle): void {
  if (picked.value !== null) return;
  picked.value = style;

  // petite augmentation Respiration, se fera apres avec calcul db 
  try {
    bumpRespiration(6);
  } catch (e: unknown) {
    errorMsg.value = "bumpRespiration() manquant dans community.ts";
  }
}

function continueFlow(): void {
  router.push("/discussion/3");
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


.layout {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 90px 70px 160px;
  row-gap: 44px;
}


.topArea {
  position: relative;
  height: 100%;
  display: grid;
  place-items: center;
  padding-top: 170px;
}


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
  width: 440px;
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


.actions {
  display: grid;
  justify-items: center;
  gap: 62px;
  transform: translateY(-40px);
}

.instruction {
  width: 860px;
  max-width: 100%;
  text-align: center;
  font-weight: 900;
  font-size: 26px;
  color: rgba(255, 255, 255, 0.86);
  margin-bottom: 12px;
}

.btn {
  width: 860px;
  max-width: 100%;
  border: none;
  border-radius: 22px;
  padding: 40px 22px;
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
  font-size: 33px;
  line-height: 1.2;
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
