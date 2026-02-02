<template>
  <StepTalk
    main-text="Honestly, I don't know if I'm ready."
    below-text="Pick the answer that feels closest."
    :buttons="[
      { id: 'notYet', label: 'Not yet.', tone: 'red' },
      { id: 'oneDay', label: 'One day… but not soon.', tone: 'blue' },
      { id: 'soon', label: 'Soon. I want to do something.', tone: 'blue' }
    ]"
    @action="onAction"
  />
</template>

<script setup lang="ts">
import StepTalk from "../shared/StepTalk.vue";

type Pick = "notYet" | "oneDay" | "soon";
const emit = defineEmits<{ (e: "pick", v: Pick): void }>();

function onAction(id: string) {
  if (id === "notYet" || id === "oneDay" || id === "soon") {
    emit("pick", id);
  }
}
</script>
