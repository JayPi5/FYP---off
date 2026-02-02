<template>
  <StepTalk
    main-text="Thank you for chatting with me! Come back and talk anytime!"
    explanation=""
    :buttons="[
      { id: 'bye', label: 'Bye! bye!', tone: 'blue' },
      { id: 'restart', label: 'Restart a conversation', tone: 'red' }
    ]"
    @action="emit('choice', $event)"
    :bubble-wide="true"
  />
</template>

<script setup lang="ts">
import StepTalk from "../shared/StepTalk.vue";
const emit = defineEmits<{ (e:'choice', id:'bye'|'restart'): void }>();
</script>
