<template>
  <StageShell>
    <router-view :key="sessionNonce" class="view" />
    <Transition name="wake-appear" appear>
      <div
        v-if="!isScreenOn"
        class="sleepOverlay"
        @pointerdown="wakeFromPresence"
        @touchstart="wakeFromPresence"
      >
        <div class="sleepHint">Toucher pour activer</div>
      </div>
    </Transition>
  </StageShell>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import StageShell from "@/shared/components/StageShell.vue";
import { isScreenOn, markPresence, sessionNonce, shouldSleepNow, turnScreenOff, turnScreenOn } from "@/shared/state/totemLifecycle";

const router = useRouter();
let pollId: ReturnType<typeof setInterval> | null = null;

function onUserActivity() {
  markPresence();
}

function wakeFromPresence() {
  turnScreenOn();
  void router.push("/discussion");
}

onMounted(() => {
  const opts: AddEventListenerOptions = { passive: true };
  window.addEventListener("pointerdown", onUserActivity, opts);
  window.addEventListener("pointermove", onUserActivity, opts);
  window.addEventListener("keydown", onUserActivity);
  window.addEventListener("touchstart", onUserActivity, opts);

  pollId = setInterval(() => {
    if (shouldSleepNow()) turnScreenOff();
  }, 2000);
});

onBeforeUnmount(() => {
  window.removeEventListener("pointerdown", onUserActivity);
  window.removeEventListener("pointermove", onUserActivity);
  window.removeEventListener("keydown", onUserActivity);
  window.removeEventListener("touchstart", onUserActivity);
  if (pollId != null) clearInterval(pollId);
});
</script>

<style>
.view {
  position: absolute;
  inset: 0;
}

.sleepOverlay {
  position: absolute;
  inset: 0;
  background: #000;
  z-index: 9999;
  display: grid;
  place-items: center;
}

.sleepHint {
  color: rgba(255, 255, 255, 0.85);
  font-size: clamp(48px, 7vw, 120px);
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  line-height: 1.1;
  text-shadow: 0 8px 28px rgba(0, 0, 0, 0.7);
  padding: 0 48px;
}

.wake-appear-enter-active,
.wake-appear-leave-active {
  transition: opacity 420ms ease, transform 420ms ease;
}

.wake-appear-enter-from,
.wake-appear-leave-to {
  opacity: 0;
  transform: scale(1.03);
}

.wake-appear-enter-to,
.wake-appear-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
