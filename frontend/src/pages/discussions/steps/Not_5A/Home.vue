<template>
  <div class="dStep dStep--home">
    <div class="dTop">
      <div class="dCluster">
        <img :src="magpieSrc" class="dMagpie magpie" alt="Magpie" />

        <div class="dBubble bubble">
          <div class="title">{{ bubble.title }}</div>
          <div class="text">{{ bubble.text }}</div>
        </div>
      </div>
    </div>

    <div class="dActions">
      <button class="dBtn dBtn--red" type="button" @click="emit('start', { entry: 'full' })">
        OK, raconte-moi tes bêtises avec la clope
      </button>

      <button
        class="dBtn dBtn--blue"
        type="button"
        @click="emit('start', { entry: secondaryEntry })"
      >
        {{ secondaryLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Led = "red" | "orange" | "green";
type Entry = "full" | "quick" | "mid" | "mini";

const props = defineProps<{
  magpieSrc: string;
  ledState: Led;
}>();

const emit = defineEmits<{ (e: "start", payload: { entry: Entry }): void }>();

type Bubble = { title: string; text: string };

const bubbles: Record<Led, Bubble[]> = {
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
};

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const bubble = computed(() => pickOne(bubbles[props.ledState]));

const secondaryLabel = computed(() => {
  if (props.ledState === "red") return "On fait un check-up de plumes.";
  if (props.ledState === "orange") return "Petit coup de pouce rapide";
  return "Petit défi rapide";
});

const secondaryEntry = computed<Entry>(() => {
  if (props.ledState === "red") return "quick";
  if (props.ledState === "orange") return "mid";
  return "mini";
});
</script>

<style scoped>
.magpie {
  transform: translateY(-50px);
}
.bubble {
  transform: translateY(-140px);
}
.title {
  font-weight: 900;
  font-size: 50px;
  margin-bottom: 10px;
  color: rgba(0, 0, 0, 0.86);
}
.text {
  font-weight: 800;
  font-size: 33px;
  line-height: 1.25;
  color: rgba(0, 0, 0, 0.75);
}
</style>
