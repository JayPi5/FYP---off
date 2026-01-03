<template>
  <div class="screen">
    <h2>Choose a mode</h2>

    <div class="grid">
      <button class="primary" @click="router.push('/quiz')">Quiz</button>
      <button class="primary" @click="router.push('/discussion')">Discussion</button>
    </div>

    <button class="ghost" @click="router.push('/')">Back</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
h2 { font-size: 48px; margin: 0; text-align: center; }
.grid { display: flex; gap: 18px; flex-wrap: wrap; justify-content: center; }
.primary { background: #19c2ff; color: #051018; font-weight: 800; min-width: 240px; }
.ghost { background: transparent; color: white; border: 2px solid #2a3a4a; }
</style>
