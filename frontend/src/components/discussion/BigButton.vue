<template>
  <button class="btn" :class="tone" type="button" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: "primary" | "secondary" | "ghost";
  }>(),
  { tone: "secondary" }
);

defineEmits<{ (e: "click"): void }>();
</script>

<style scoped>
.btn {
  width: 100%;
  border: none;
  border-radius: 22px;
  padding: 20px 22px;
  font-weight: 900;
  font-size: 28px;
  cursor: pointer;
  transition: transform 0.06s ease;
}
.btn:active {
  transform: scale(0.99);
}

.primary {
  background: rgba(255, 255, 255, 0.92);
  color: #0b0b0c;
}

.secondary {
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
}

.ghost {
  background: transparent;
  outline: 2px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
}
</style>
