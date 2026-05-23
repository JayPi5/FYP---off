import { computed, ref } from "vue";
import {
  clampSessionMood,
  type SessionMood,
} from "@/features/discussion/flow/magpieMoodModel";

const sessionMoodRef = ref<SessionMood>(0);

export const sessionMood = computed(() => sessionMoodRef.value);

export function applySessionMoodDelta(delta: number): void {
  if (delta <= 0) return;
  sessionMoodRef.value = clampSessionMood(sessionMoodRef.value + delta);
}

export function resetSessionMood(): void {
  sessionMoodRef.value = 0;
}
