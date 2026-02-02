<template>
  <div class="dStep">
    <div class="dTop">
      <div class="dCluster">
        <div class="magpieWrap">
          <!-- ✅ LED-driven magpie image -->
          <img class="magpieImg" :src="magpieSrc" alt="Magpie" />
        </div>

        <div class="dBubble" style="width: 980px; max-width: 100%; text-align: left;">
          <div class="mainText">Help the bird answer. Choose with him.</div>
          <div class="explain">(10-point slidebar with changing text)</div>

          <div class="list">
            <button v-for="item in items" :key="item.level" class="row" @click="emit('pick', item.level)">
              <span class="lvl">L{{ item.level }}</span>
              <span class="txt">{{ item.text }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="dActions">
      <button class="dBtn dBtn--red" @click="emit('back')">Back</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { magpieSrc } from "../../../../state/communityUi";

const emit = defineEmits<{
  (e: "pick", level: number): void;
  (e: "back"): void;
}>();

const items = [
  { level: 10, text: "I have quit smoking and I will never smoke again." },
  { level: 9, text: "I have quit smoking, but I still worry about slipping back, so I need to keep working on living smoke free." },
  { level: 8, text: "I still smoke, but I have begun to change, like cutting back on the number of cigarettes I smoke. I am ready to set a quit date." },
  { level: 7, text: "I definitely plan to quit smoking within the next 30 days." },
  { level: 6, text: "I definitely plan to quit smoking in the next 6 months." },
  { level: 5, text: "I often think about quitting smoking, but I have no plans to quit." },
  { level: 4, text: "I sometimes think about quitting, but I have no plans to quit." },
  { level: 3, text: "I rarely think about quitting smoking, and I have no plans to quit." },
  { level: 2, text: "I never think about quitting smoking, and I have no plans to quit." },
  { level: 1, text: "I enjoy smoking and have decided not to quit smoking for my lifetime. I have no interest in quitting." },
];
</script>

<style scoped>
.dStep{
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
}

/* Top area keeps everything visually centered vertically */
.dTop{
  display: grid;
  align-items: start;
  justify-items: center;
  padding-top: 260px; /* pushes magpie + bubble up like other screens */
}

/* ✅ This is the KEY: move the whole pair to the LEFT */
.dCluster{
  display: grid;
  grid-template-columns: 360px minmax(520px, 680px);
  align-items: center;
  gap: 26px;

  /* shift left so the bubble fits in the phone */
  transform: translateX(-80px);
}

/* Magpie sizing */
.magpieWrap {
  width: 360px;
  height: 360px;
  display: grid;
  place-items: center;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
}
.magpieImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* ✅ Bubble: make it fixed-width and safe */
.dBubble{
  width: 680px !important;      /* overrides inline 980px */
  max-width: 680px !important;  /* prevents cutting */
  background: rgba(255,255,255,0.92);
  border-radius: 18px;
  padding: 18px 18px 14px;
  overflow: hidden;             /* prevents overflow outside bubble */
}

.mainText { font-weight: 900; font-size: 24px; color: #111; }

.explain { margin-top: 10px; opacity: .75; color: #111; }

/* List */
.list {
  margin-top: 14px;
  display: grid;
  gap: 12px;
  max-height: 990px;
  overflow: auto;
  padding-right: 6px;
}

.row {
  width: 100%;
  border: none;
  background: rgba(0,0,0,0.06);
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  text-align: left;
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  font-size: 24px; /* slightly smaller so lines don’t clip */
  color: #111;
}
.row:hover { background: rgba(0,0,0,0.10); }
.lvl { font-weight: 900; }
.txt { line-height: 1.25; }

/* ✅ Center the Back button */
.dActions{
  display: grid;
  justify-items: center;
  padding: 24px 0 40px;
}
.dBtn{
  width: 760px;
  height: 86px;
  border-radius: 18px;
  font-size: 28px;
  font-weight: 900;
}

</style>
