<template>
  <div class="dStep">
    <div class="dTop">
      <div class="dCluster">
        <div class="magpieWrap">
         
          <img class="magpieImg" :src="magpieSrc" alt="Magpie" />
        </div>

        <div class="dBubble" style="width: 980px; max-width: 100%; text-align:left;">
          <div class="mainText">
            I did try this one and it is really helpful! Give it a try!
          </div>

          <div class="explain" style="margin-top:10px; opacity:.85;">
            Scan the QR-Code below and engage with your personal agent
          </div>

          <QrPlaceholder :label="qrLabel" />
        </div>
      </div>
    </div>

    <div class="dActions">
      <button class="dBtn dBtn--blue" @click="emit('done')">Thanks mate!</button>
      <button class="dBtn dBtn--blue" @click="emit('done')">See you around!</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import QrPlaceholder from "../shared/QrPlaceHolder.vue";

// ✅ Single source of truth: LED state → magpie image
import { magpieSrc } from "../../../../state/communityUi";

const props = defineProps<{ agent: "expert" | "smoker" | "future" }>();
const emit = defineEmits<{ (e: "done"): void }>();

const qrLabel = computed(() => {
  if (props.agent === "expert") return "Agent: Smoking Cessation Expert";
  if (props.agent === "smoker") return "Agent: Someone who smokes";
  return "Agent: Future You";
});
</script>

<style scoped>
.dStep {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 64px;
  gap: 18px;
  color: #fff;
}

/* move whole top block LOWER (magpie + bubble together) */
.dTop {
  display: grid;
  justify-items: center;
  align-content: start;
  padding-top: 300px; /* ⬅️ increase to push lower */
  gap: 18px;
}

/* keep cluster centered and constrained */
.dCluster {
  display: grid;
  grid-template-columns: 320px minmax(460px, 720px);
  gap: 44px;
  align-items: center;
  width: min(100%, 1120px);
  justify-content: center;
}

.magpieWrap {
  width: 320px;
  height: 320px;
  display: grid;
  place-items: center;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
}

.magpieImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* bubble now never overflows */
.dBubble {
  width: 100%;
  max-width: 720px;
  border-radius: 28px;
  padding: 34px;
  background: rgba(255, 255, 255, 0.06);
  outline: 2px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55);
  color: #fff;
  text-align: center;
  overflow: hidden;
  
}

.mainText {
  font-weight: 950;
  font-size: 30px; /* ⬅️ bigger bubble title */
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.explain {
  margin-top: 10px;
  opacity: 0.85;
  font-size: 20px; /* ⬅️ explanation size */
  overflow-wrap: anywhere;
}

/* buttons centered like other screens */
.dActions {
  display: grid;
  gap: 16px;
  margin-bottom: 240px;
  justify-items: center;
}

.dBtn {
  width: min(100%, 920px);
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
</style>
