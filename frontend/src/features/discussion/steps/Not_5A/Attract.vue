<template>
  <StepTalk
    :offset-y="-220"
    :main-variants="[
      'Do you have a cig?',
      'Do you have some fire?',
      'Help a fellow smoker quit today?'
    ]"
    below-text="Tap anywhere to begin"
    :buttons="[
      { id: 'start', label: 'Start', tone: 'blue' }
    ]"
    @tap="emit('next')"
    @action="emit('next')"
  />
</template>

<script setup lang="ts">
import StepTalk from "../shared/StepTalk.vue";

const emit = defineEmits<{ (e: "next"): void }>();
</script>
