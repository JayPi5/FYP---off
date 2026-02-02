<template>
  <div class="shell">
    <div class="phoneWrap" :style="wrapStyle" aria-label="Phone frame">
      <div class="phone" :style="phoneStyle">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const BASE_W = 1080;
const BASE_H = 1920;
const FIT = 0.96; // % of viewport used by the phone

const scale = ref(1);

function recomputeScale() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Fit phone inside viewport while keeping 9:16
  const s = Math.min((vw * FIT) / BASE_W, (vh * FIT) / BASE_H);

  // Prevent weird 0 scale
  scale.value = Math.max(0.1, s);
}

onMounted(() => {
  recomputeScale();
  window.addEventListener("resize", recomputeScale);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", recomputeScale);
});

const wrapStyle = computed(() => ({
  width: `${BASE_W * scale.value}px`,
  height: `${BASE_H * scale.value}px`,
}));

const phoneStyle = computed(() => ({
  transform: `scale(${scale.value})`,
}));
</script>

<style scoped>
.shell {
  width: 100vw;
  height: 100vh;
  background: #0b0b0c;
  display: grid;
  place-items: center;
  overflow: hidden;
}

/* This box has the REAL (scaled) size => perfect centering */
.phoneWrap {
  position: relative;
  border-radius: 46px;
  overflow: hidden;

  background: #0b0b0c;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.65);
  outline: 1px solid rgba(255, 255, 255, 0.06);
}

/* This is the DESIGN canvas (1080x1920) that we scale */
.phone {
  position: absolute;
  top: 0;
  left: 0;
  width: 1080px;
  height: 1920px;

  transform-origin: top left;
  background: #0b0b0c;
  overflow: hidden;

  /* ✅ Important: absolute HUDs must stay inside the phone */
  /* (positioned element => containing block for children) */
}
</style>
