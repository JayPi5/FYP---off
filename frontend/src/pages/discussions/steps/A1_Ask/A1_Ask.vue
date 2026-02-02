<template>
  <StepTalk
    :main-variants="mainVariants"
    :below-text="belowText"
    :buttons="buttons"
    @action="onAction"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import StepTalk from "../shared/StepTalk.vue";

type Choice = "b1" | "b3";
const emit = defineEmits<{ (e: "choice", id: Choice): void }>();

const mainVariants = [
  "Hi... I think I've burnt my feathers a bit too much.\nCan you help me out?",
  "Hey, human! See that smoke over there?\nIt's kind of mine. Want to talk about it?",
  "Smoky bird alert.\nEmergency feather check-up needed."
] as const;

const belowText =
  "By helping this bird, you'll discover support options for smokers around your Campus.";

const blueLabel = Math.random() < 0.5
  ? "Ok, tell me about your smoking nonsense."
  : "Let's do a feather check-up.";

const buttons = computed(() => [
  { id: "b1", label: blueLabel, tone: "blue" as const },
  { id: "b3", label: "Nevermind, I also smoke like there is no tomorrow, there is nothing to worry about…", tone: "red" as const }
]);

function onAction(id: string) {
  if (id === "b3") return emit("choice", "b3");
  emit("choice", "b1");
}
</script>
