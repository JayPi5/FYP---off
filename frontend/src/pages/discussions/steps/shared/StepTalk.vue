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
import { magpieSrc as autoMagpieSrc } from "../../../../state/communityUi";

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
  padding: 64px;
  gap: 18px;
  color: #fff;
}

.dTop {
  display: grid;
  align-items: center;
}

.dCluster {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 44px;
  align-items: center;
}

.magpieWrap {
  width: 360px;
  height: 360px;
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
  border-radius: 28px;
  padding: 42px;
  background: rgba(255, 255, 255, 0.06);
  outline: 2px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55);
  max-width: 780px;
  color: #fff;
}

.mainText {
  font-weight: 950;
  font-size: 44px;
  line-height: 1.15;
  white-space: pre-line;
}

/* ✅ Explanation OUTSIDE bubble, between cluster and buttons */
.dExplain {
  margin-top: -200px; /* pulls it closer to the cluster since cluster is moved up */
  text-align: center;
  font-weight: 900;
  font-size: 35px;   /* bigger than before */
  line-height: 1.35;
  opacity: 0.92;
  white-space: pre-line;
  max-width: 980px;
  justify-self: center;
}


.dActions {
  display: grid;
  gap: 40px;
  margin-bottom: 240px; 
  justify-self: stretch;
}

.dBtn {
  border: none;
  border-radius: 18px;
  padding: 22px 26px;
  font-size: 30px;
  font-weight: 950;
  cursor: pointer;
  color: #fff;
}

.dBtn--blue {
  background: rgba(60, 120, 220, 0.72);
}

.dBtn--red {
  background: rgba(220, 80, 80, 0.72);
}
</style>
