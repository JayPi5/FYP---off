<template>
  <!-- On affiche A1, puis plus tard A1b etc. -->
  <Ecran1
    v-if="step === 'A1'"
    :magpie-src="magpieSrc"
    @next="handleA1Next"
  />

  <!-- Placeholder temporaire pour montrer que ça avance -->
  <div v-else class="placeholder">
    <div class="title">✅ A1 terminé</div>
    <div class="text">
      Tu as choisi une façon de poser la question :
      <b>{{ askStyleLabel }}</b>
    </div>

    <button class="backBtn" type="button" @click="step = 'A1'">
      ⬅ Retour à A1
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Ecran1 from "./discussions/Ecran1.vue";

import magpieGreen from "../assets/magpie_green.png";
import magpieOrange from "../assets/magpie_orange.png";
import magpieRed from "../assets/magpie_red.png";

type LedState = "red" | "orange" | "green";
type Step = "A1";
type AskStyle = "scale" | "count";

/** Pour l’instant on force rouge (test). Tu changeras après. */
const ledState = ref<LedState>("red");

const magpieSrc = computed(() => {
  if (ledState.value === "green") return magpieGreen;
  if (ledState.value === "orange") return magpieOrange;
  return magpieRed;
});

/** State machine (pour l’instant juste A1) */
const step = ref<Step>("A1");

/** On garde ce que l’utilisateur a cliqué (juste pour test) */
const askStyle = ref<AskStyle | null>(null);

const askStyleLabel = computed(() => {
  if (askStyle.value === "scale") return "peu / moyen / beaucoup";
  if (askStyle.value === "count") return "combien par jour";
  return "—";
});

function handleA1Next(payload: { askStyle: AskStyle }) {
  askStyle.value = payload.askStyle;

  // Ici plus tard: step.value = "A1B"
  // Pour l’instant: on montre un placeholder
  // (comme ça tu vois que le click marche)
  // @ts-expect-error placeholder state
  step.value = "DONE";
}
</script>

<style scoped>
.placeholder {
  width: 100%;
  height: 100%;
  background: #0b0b0c;
  color: rgba(255, 255, 255, 0.92);
  display: grid;
  place-items: center;
  gap: 22px;
  padding: 120px;
}

.title {
  font-weight: 900;
  font-size: 44px;
}

.text {
  font-weight: 800;
  font-size: 28px;
  text-align: center;
  max-width: 900px;
  line-height: 1.25;
}

.backBtn {
  border: none;
  border-radius: 18px;
  padding: 18px 22px;
  font-weight: 900;
  font-size: 22px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
}
.backBtn:active {
  transform: scale(0.99);
}
</style>
