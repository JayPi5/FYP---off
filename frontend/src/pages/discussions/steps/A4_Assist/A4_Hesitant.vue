<template>
  <StepTalk
    main-text="Yes you're right, it is still in the back of my mind. But I don't really know what to do..."
    below-text="Help the bird discover what kind of support it would rather have"
    :buttons="[
      { id: 'peer', label: 'Peer-support?', tone: 'blue' },
      { id: 'face', label: 'Face-to-face coaching?', tone: 'blue' },
      { id: 'other', label: 'Other?', tone: 'blue' }
    ]"
    @action="onAction"
  />
</template>

<script setup lang="ts">
import StepTalk from "../shared/StepTalk.vue";

type Pick = "peer" | "face" | "other";
const emit = defineEmits<{ (e: "pick", v: Pick): void }>();

function onAction(id: string) {
  if (id === "peer" || id === "face" || id === "other") {
    emit("pick", id);
  }
}
</script>
