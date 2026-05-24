<template>
  <div class="dStep" @click="emit('tap')">
    <!-- Top zone: bird + bubble -->
    <div class="dTop">
      <div class="dCluster" :style="clusterStyle">
        <div class="magpieWrap">
          <img class="magpieImg" :src="resolvedMagpieSrc" alt="Magpie" />
        </div>

        <div class="dBubble" :style="bubbleStyle">
          <div class="mainText">{{ resolvedMain }}</div>
        </div>
      </div>
    </div>

    <!-- Middle zone: explanation OUTSIDE the bubble -->
    <div v-if="resolvedBelow" class="dExplain">
      {{ resolvedBelow }}
    </div>

    <!-- Bottom zone: actions -->
    <div v-if="resolvedButtons.length" class="dActions">
      <button
        v-for="b in resolvedButtons"
        :key="b.id"
        class="dBtn"
        :class="b.tone === 'red' ? 'dBtn--red' : 'dBtn--blue'"
        type="button"
        @click.stop="onBtn(b.id)"
      >
        {{ b.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type CSSProperties } from "vue";
import { magpieSrc as autoMagpieSrc } from "@/shared/state/communityUi";

type ButtonTone = "red" | "blue";
export type StepButton<T extends string = string> = {
  id: T;
  label: string;
  tone?: ButtonTone;
};

function pickOne(arr: readonly string[]): string {
  return arr[Math.floor(Math.random() * arr.length)] ?? "";
}

const props = defineProps<{
  magpieSrc?: string;

  mainText?: string;
  mainVariants?: readonly string[];

  belowText?: string;
  belowVariants?: readonly string[];

  buttons?: readonly StepButton[];

  bubbleWidth?: number;
  bubbleMaxWidth?: number;
  bubbleAlign?: "left" | "center" | "right";

  /** Optional per-step override. Default keeps layout higher. */
  offsetY?: number;

  // legacy support (older steps)
  explanation?: string;
  bubbleWide?: boolean;
  onAction?: (id: string) => void;
}>();

const emit = defineEmits<{
  (e: "action", id: string): void;
  (e: "tap"): void;
}>();

// stable random pick once
const chosenMain = ref(
  props.mainVariants?.length ? pickOne(props.mainVariants) : props.mainText ?? ""
);

const chosenBelow = ref(
  props.belowVariants?.length
    ? pickOne(props.belowVariants)
    : props.belowText ?? props.explanation ?? ""
);

const resolvedMain = computed(() => chosenMain.value);
const resolvedBelow = computed(() => chosenBelow.value);
const resolvedButtons = computed(() => (props.buttons ? [...props.buttons] : []));

const resolvedMagpieSrc = computed(() => props.magpieSrc ?? autoMagpieSrc.value);

function onBtn(id: string) {
  props.onAction?.(id);
  emit("action", id);
}

// default “higher” layout
const clusterStyle = computed<CSSProperties>(() => {
  const y = props.offsetY ?? -220;
  return { transform: `translateY(${y}px)` };
});

const bubbleStyle = computed<CSSProperties>(() => {
  const s: CSSProperties = {};
  const align = props.bubbleAlign ?? "center";
  s.textAlign = align;

  if (props.bubbleWidth) s.width = `${props.bubbleWidth}px`;
  if (props.bubbleMaxWidth) s.maxWidth = `${props.bubbleMaxWidth}px`;

  if (props.bubbleWide) {
    s.width = s.width ?? "560px";
    s.maxWidth = s.maxWidth ?? "560px";
  }
  return s;
});
</script>

<style scoped>
/* Layout: top (cluster) + middle (explain) + bottom (actions) */
.dStep {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto auto;
  padding: var(--pad-top) var(--pad-x) var(--pad-bottom);
  gap: 18px;
  color: #fff;
}

.dTop {
  display: grid;
  align-items: center;
}

.dCluster {
  display: grid;
  grid-template-columns: var(--magpie-size) minmax(520px, var(--bubble-max-width));
  gap: var(--cluster-gap);
  align-items: center;
  width: min(100%, var(--cluster-max-width));
  justify-content: center;
}

.magpieWrap {
  width: var(--magpie-size);
  height: var(--magpie-size);
  display: grid;
  place-items: center;
}

.magpieImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
}

.dBubble {
  border-radius: var(--bubble-radius);
  padding: var(--bubble-pad);
  background: var(--bubble-bg);
  outline: var(--bubble-outline);
  box-shadow: var(--bubble-shadow);
  max-width: var(--bubble-max-width);
  color: #fff;
}

.mainText {
  font-weight: 950;
  font-size: var(--main-text-size);
  line-height: 1.15;
  white-space: pre-line;
}

/* ✅ Explanation OUTSIDE bubble, between cluster and buttons */
.dExplain {
  margin-top: -130px;
  text-align: center;
  font-weight: 900;
  font-size: var(--explain-text-size);
  line-height: 1.35;
  opacity: 0.92;
  white-space: pre-line;
  max-width: 980px;
  justify-self: center;
}


.dActions {
  display: grid;
  gap: var(--btn-gap);
  margin-bottom: var(--actions-bottom-space);
  justify-self: stretch;
}

.dBtn {
  border: none;
  border-radius: var(--btn-radius);
  padding: var(--btn-pad-y) var(--btn-pad-x);
  font-size: var(--btn-font);
  font-weight: 950;
  cursor: pointer;
  color: #fff;
  width: min(100%, var(--btn-max-width));
  justify-self: center;
}

.dBtn--blue {
  background: rgba(60, 120, 220, 0.72);
}

.dBtn--red {
  background: rgba(220, 80, 80, 0.72);
}
</style>
