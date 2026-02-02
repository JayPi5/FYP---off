<template>
  <div class="qrBox">
    <div class="qrTitle">[QR-Code]</div>
    <div class="qrSmall">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<style scoped>
.qrBox {
  margin-top: 18px;
  width: 360px;
  height: 360px;
  background: #fff;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: #111;
  box-shadow: 0 18px 45px rgba(0,0,0,0.25);
}
.qrTitle { font-weight: 900; font-size: 22px; }
.qrSmall { margin-top: 6px; font-size: 14px; opacity: 0.7; text-align: center; padding: 0 14px; }
</style>
