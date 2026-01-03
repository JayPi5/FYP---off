<template>
  <div class="kiosk">
    <router-view />
  </div>
</template>

<style>
.kiosk {
  width: 100vw;
  height: 100vh;
  background: #0b0f14;
  color: white;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  overflow: hidden;
}

button {
  font-size: 28px;
  padding: 18px 28px;
  border-radius: 16px;
  border: 0;
  cursor: pointer;
}
</style>
