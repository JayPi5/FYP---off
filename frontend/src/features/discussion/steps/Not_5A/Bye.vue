<template>
  <StepTalk
    main-text="Bye bye!"
    explanation=""
    :buttons="[{ id: 'restart', label: 'Restart', tone: 'blue' }]"
    @action="emit('restart')"
  />
</template>

<script setup lang="ts">
import StepTalk from "../shared/StepTalk.vue";
const emit = defineEmits<{ (e:'restart'): void }>();
</script>
