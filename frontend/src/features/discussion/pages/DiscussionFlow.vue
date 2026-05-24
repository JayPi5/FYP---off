<template>
  <DiscussionLayout>
    <component
      :is="Current"
      v-bind="currentProps"
      @next="onNext"
      @choice="onChoice"
      @pick="onPick"
      @back="go('A3')"
      @thanks="go('Greetings')"
      @ai="go('ArrangeAppVersions')"
      @done="go('Greetings')"
      @restart="reset()"
    />
  </DiscussionLayout>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";
import DiscussionLayout from "./DiscussionLayout.vue";
import { useDiscussionFlow } from "@/features/discussion/composables/useDiscussionFlow";
import { markPresence, turnScreenOff } from "@/shared/state/totemLifecycle";

const {
  step,
  Current,
  currentProps,
  onNext,
  onChoice,
  onPick,
  go,
  reset,
} = useDiscussionFlow();

let byeTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  step,
  (value) => {
    markPresence();
    if (byeTimer != null) {
      clearTimeout(byeTimer);
      byeTimer = null;
    }
    if (value === "Bye") {
      // Simulate totem "screen off" after goodbye.
      byeTimer = setTimeout(() => turnScreenOff(), 5000);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (byeTimer != null) clearTimeout(byeTimer);
});
</script>
