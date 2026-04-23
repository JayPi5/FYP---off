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

    <div v-if="isDev" class="dev">
      <div class="devTitle">DEV — step: {{ step }}</div>
      <select v-model="step">
        <option v-for="s in allSteps" :key="s" :value="s">{{ s }}</option>
      </select>
      <button type="button" @click="reset()">Reset</button>
    </div>
  </DiscussionLayout>
</template>

<script setup lang="ts">
import DiscussionLayout from "./DiscussionLayout.vue";
import { useDiscussionFlow } from "@/features/discussion/composables/useDiscussionFlow";

const isDev = import.meta.env.DEV;

const {
  allSteps,
  step,
  Current,
  currentProps,
  onNext,
  onChoice,
  onPick,
  go,
  reset,
} = useDiscussionFlow();
</script>

<style scoped>
.dev {
  position: absolute;
  left: 18px;
  bottom: 18px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 10px 12px;
  border-radius: 14px;
  color: #fff;
  display: grid;
  gap: 8px;
  width: 260px;
}
.devTitle {
  font-weight: 900;
  font-size: 12px;
  opacity: 0.9;
}
select,
button {
  padding: 8px;
  border-radius: 10px;
  border: none;
}
button {
  cursor: pointer;
  font-weight: 900;
}
</style>
