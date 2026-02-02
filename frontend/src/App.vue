<template>
  <StageShell>
    <router-view class="view" />
  </StageShell>
</template>

<script setup lang="ts">
import StageShell from "./components/StageShell.vue";
</script>

<style>
.view {
  position: absolute;
  inset: 0;
}
</style>
