<template>
  <StepTalk
    main-text="Yeah!, you know what?! Another smoker told me that HEG Arc and UniNE developed an AI agent that provides help for smokers motivated to quit. Whats to try?"
    explanation="Actually there are many agents, with which one would you like to exchange?"
    :buttons="[
      { id: 'expert', label: 'Smoking Cessation Expert', tone: 'blue' },
      { id: 'smoker', label: 'Someone else who smokes', tone: 'blue' },
      { id: 'future', label: `Future you! That's magic!`, tone: 'blue' }
    ]"
    :bubble-wide="true"
    @action="(id) => emit('pick', id as 'expert'|'smoker'|'future')"
  />
</template>

<script setup lang="ts">
import StepTalk from "../shared/StepTalk.vue";

const emit = defineEmits<{
  (e: "pick", id: "expert" | "smoker" | "future"): void;
}>();
</script>
