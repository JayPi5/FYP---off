<template>
  <StepTalk
    main-text="Yes you're right, it's a long time I am thinking about it, now I need to do something"
    below-text="Help the bird discover what kind of support it would rather have"
    :buttons="[
      { id: 'expert', label: 'Chat with an expert?', tone: 'blue' },
      { id: 'smoker', label: 'Chat with another smoker?', tone: 'blue' },
      { id: 'future', label: 'That would be amazing to talk with your future-self, just to know how I quit!', tone: 'blue' }
    ]"
    @action="onAction"
  />
</template>

<script setup lang="ts">
import StepTalk from "../shared/StepTalk.vue";

type Pick = "expert" | "smoker" | "future";
const emit = defineEmits<{ (e: "pick", v: Pick): void }>();

function onAction(id: string) {
  if (id === "expert" || id === "smoker" || id === "future") emit("pick", id);
}
</script>
