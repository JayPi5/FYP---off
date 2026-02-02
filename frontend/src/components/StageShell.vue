<template>
  <div ref="shellEl" class="shell" aria-label="StageShell">
    <div class="stageFrame" :style="{ transform: stageTransform }">
      <div class="stage" :style="{ width: `${stageW}px`, height: `${stageH}px` }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    stageW?: number;
    stageH?: number;
    /** percentage of viewport the stage is allowed to occupy */
    fit?: number; // e.g. 0.92
  }>(),
  {
    stageW: 1080,
    stageH: 1920,
    fit: 0.99,
  }
);

const shellEl = ref<HTMLElement | null>(null);
const scale = ref(1);

function recomputeScale() {
  const el = shellEl.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const sw = (rect.width * props.fit) / props.stageW;
  const sh = (rect.height * props.fit) / props.stageH;
  scale.value = Math.min(sw, sh);
}

let ro: ResizeObserver | null = null;

onMounted(() => {
  recomputeScale();
  ro = new ResizeObserver(recomputeScale);
  if (shellEl.value) ro.observe(shellEl.value);
  window.addEventListener("resize", recomputeScale);
});

onBeforeUnmount(() => {
  if (ro && shellEl.value) ro.unobserve(shellEl.value);
  ro = null;
  window.removeEventListener("resize", recomputeScale);
});

const stageTransform = computed(() => {
  return `translate(-50%, -50%) scale(${scale.value})`;
});
</script>

<style scoped>
.shell {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  /* makes the “outside” feel like a kiosk background, not empty space */
  background: radial-gradient(
    circle at center,
    rgba(25, 25, 28, 1) 0%,
    rgba(11, 11, 12, 1) 55%,
    rgba(0, 0, 0, 1) 100%
  );
}


/* This wrapper is what we scale */
.stageFrame {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  
}

/* The fixed 1080x1920 stage */
.stage {
  position: relative;
  background: #0b0b0c;
  overflow: hidden;

  /* phone-like frame */
  border-radius: 26px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.65);
}
</style>
