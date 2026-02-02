<template>
  <StepTalk
    :main-variants="[
      `Honestly, I don't know if I'm ready.`,
      `Part of me wants to quit... the other part prefers smoking.`,
      `My brain says 'yes,' but my hand lights up anyway.`
    ]"
    explanation="Help the bird with an advise for it health."
    :buttons="[
      { id: 'scale', label: `On a scale of 0 to 10, how strong is your desire to quit?`, tone: 'blue' },
      { id: 'when', label: `Do you see yourself quitting 'one day,' 'soon,' or 'not yet'?`, tone: 'blue' }
    ]"
    @action="emit('choice', $event)"
  />
</template>

<script setup lang="ts">
import StepTalk from "../shared/StepTalk.vue";
const emit = defineEmits<{ (e:'choice', id:'scale'|'when'): void }>();
</script>
