<template>
  <div class="screen">
    <h2>Discussion (placeholder)</h2>
    <p>Next: branching dialogue + quick buttons.</p>

    <button class="primary" @click="router.push('/qr')">Finish → QR</button>
    <button class="ghost" @click="router.push('/modes')">Back</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<style scoped>
.screen { height: 100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; text-align:center; }
h2 { font-size: 44px; margin: 0; }
p { opacity: .85; font-size: 20px; margin: 0; max-width: 720px; }
.primary { background:#19c2ff; color:#051018; font-weight:800; }
.ghost { background: transparent; color: white; border: 2px solid #2a3a4a; }
</style>
