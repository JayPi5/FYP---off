<template>
  <StepTalk
    main-text="You're right: one day—maybe sooner than I think—I'll want to quit, but I wouldn't even know where to start?!"
    below-text="Help the bird discover smoking cessation offers in Neuchâtel region"
    :buttons="[
      { id: 'pharmacie', label: 'Did you know that Pharmacie Plus in La Maladière has an offer?', tone: 'blue' },
      { id: 'stop', label: 'Do you know stop-tabac.ch?', tone: 'blue' },
      { id: 'cipret', label: 'I personally had a free coaching session with CIPRET Neuchâtel to help me make up my mind about smoking.', tone: 'blue' }
    ]"
    @action="onAction"
  />
</template>

<script setup lang="ts">
import StepTalk from "../shared/StepTalk.vue";

type Pick = "pharmacie" | "stop" | "cipret";
const emit = defineEmits<{ (e: "pick", v: Pick): void }>();

function onAction(id: string) {
  if (id === "pharmacie" || id === "stop" || id === "cipret") emit("pick", id);
}
</script>
