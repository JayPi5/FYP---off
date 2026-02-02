<template>
  <StepTalk
    magpie-variant="orange"
    :main-variants="[
      `So... I smoke. But not THAT much... I think.`,
      `Let’s just say I have a stable relationship with my pocket. Too stable.`,
      `I light up often... well, too often for my little feathers.`
    ]"
    below-text="Help the bird with a simple health advice."
    :buttons="[
      { id: 'b1', label: 'Quitting would be really good for your health and your breathing.', tone: 'blue' },
      { id: 'b2', label: 'You can also start by reducing, which is already a good step.', tone: 'blue' }
    ]"
    @action="emit('next')"
  />
</template>

<script setup lang="ts">
import StepTalk from "../shared/StepTalk.vue";

const emit = defineEmits<{
  (e: "next"): void;
}>();
</script>
