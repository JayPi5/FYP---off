import { computed, ref } from "vue";
import { resetSessionMood } from "./sessionMood";

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000;

/** Totem starts asleep so “Touch to wake” shows on every fresh load. */
const isScreenOnRef = ref(false);
const lastActivityAtRef = ref<number>(Date.now());
const sessionNonceRef = ref(1);

export const isScreenOn = computed(() => isScreenOnRef.value);
export const sessionNonce = computed(() => sessionNonceRef.value);

export function markPresence(): void {
  lastActivityAtRef.value = Date.now();
}

export function turnScreenOff(): void {
  if (!isScreenOnRef.value) return;
  isScreenOnRef.value = false;
}

export function turnScreenOn(): void {
  const wasOff = !isScreenOnRef.value;
  isScreenOnRef.value = true;
  lastActivityAtRef.value = Date.now();
  if (wasOff) {
    resetSessionMood();
    // Force the discussion view to remount to a clean session.
    sessionNonceRef.value += 1;
  }
}

export function shouldSleepNow(nowMs = Date.now()): boolean {
  return isScreenOnRef.value && nowMs - lastActivityAtRef.value >= INACTIVITY_TIMEOUT_MS;
}

