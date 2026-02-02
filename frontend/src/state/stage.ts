// src/state/stage.ts
import { onBeforeUnmount, onMounted, ref } from "vue";

export const STAGE_W = 1080;
export const STAGE_H = 1920;

export const stageScale = ref(1);

function recompute() {
  const sw = window.innerWidth / STAGE_W;
  const sh = window.innerHeight / STAGE_H;
  stageScale.value = Math.min(sw, sh);
}

export function useStageScale() {
  onMounted(() => {
    recompute();
    window.addEventListener("resize", recompute);
  });
  onBeforeUnmount(() => window.removeEventListener("resize", recompute));
}
