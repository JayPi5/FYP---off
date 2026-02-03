<template>
  <DiscussionLayout>
    <component
      :is="Current"
      v-bind="currentProps"
      @next="onNext"
      @choice="onChoice"
      @pick="onPick"
      @back="go('A3')"
      @thanks="go('Greetings')"
      @ai="go('ArrangeAppVersions')"
      @done="go('Greetings')"
      @restart="reset()"
    />

    <!-- dev helper (optional): quick jump -->
    <div v-if="isDev" class="dev">
      <div class="devTitle">DEV — step: {{ step }}</div>
      <select v-model="step">
        <option v-for="s in allSteps" :key="s" :value="s">{{ s }}</option>
      </select>
      <button @click="reset()">Reset</button>
    </div>
  </DiscussionLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import DiscussionLayout from "./DiscussionLayout.vue";

// steps
import Attract from "./steps/Not_5A/Attract.vue";
import A1 from "./steps/A1_Ask/A1_Ask.vue";
import A2 from "./steps/A2_Advise/A2_Advise.vue";
import A3 from "./steps/A3_Assess/A3_Assess.vue";

import AssessApprox from "./steps/A3_Assess/A3_3choices.vue";
import AssessPrecise from "./steps/A3_Assess/A3_RTQ.vue";

import AssistWithdrawal from "./steps/A4_Assist/A4_NotReady.vue";
import AssistSupport from "./steps/A4_Assist/A4_Hesitant.vue";
import AssistPlan from "./steps/A4_Assist/A4_Ready.vue";
import AssistAppLink from "./steps/A4_Assist/A4_LastAssist.vue";

import ArrangeOffersFiltred from "./steps/A5_Arrange/ArrangeOffersFiltred.vue";
import ArrangeAppVersions from "./steps/A5_Arrange/A5_HEGxUniNE.vue";
import ArrangeQr from "./steps/A5_Arrange/A5_SmokwitQR.vue";

import Greetings from "./steps/Not_5A/Greetings.vue";
import Bye from "./steps/Not_5A/Bye.vue";

type StepId =
  | "Attract"
  | "A1"
  | "A2"
  | "A3"
  | "AssessApprox"
  | "AssessPrecise"
  | "AssistWithdrawal"
  | "AssistSupport"
  | "AssistPlan"
  | "AssistAppLink"
  | "ArrangeOffersFiltred"
  | "ArrangeAppVersions"
  | "ArrangeQr"
  | "Greetings"
  | "Bye";

const allSteps: StepId[] = [
  "Attract", "A1", "A2", "A3",
  "AssessApprox", "AssessPrecise",
  "AssistWithdrawal", "AssistSupport", "AssistPlan", "AssistAppLink",
  "ArrangeOffersFiltred", "ArrangeAppVersions", "ArrangeQr",
  "Greetings", "Bye"
];

const step = ref<StepId>("Attract");

// session context
const offerFilter = ref<string | null>(null);
const agent = ref<"expert" | "smoker" | "future">("expert");

const isDev = import.meta.env.DEV;

function go(s: StepId) {
  step.value = s;
}

function reset() {
  offerFilter.value = null;
  agent.value = "expert";
  step.value = "Attract";
}

const Current = computed(() => {
  switch (step.value) {
    case "Attract": return Attract;
    case "A1": return A1;
    case "A2": return A2;
    case "A3": return A3;

    case "AssessApprox": return AssessApprox;
    case "AssessPrecise": return AssessPrecise;

    case "AssistWithdrawal": return AssistWithdrawal;
    case "AssistSupport": return AssistSupport;
    case "AssistPlan": return AssistPlan;
    case "AssistAppLink": return AssistAppLink;

    case "ArrangeOffersFiltred": return ArrangeOffersFiltred;
    case "ArrangeAppVersions": return ArrangeAppVersions;
    case "ArrangeQr": return ArrangeQr;

    case "Greetings": return Greetings;
    case "Bye": return Bye;
  }
});

const currentProps = computed(() => {
  if (step.value === "ArrangeOffersFiltred") return { filterKey: offerFilter.value };
  if (step.value === "ArrangeQr") return { agent: agent.value };
  return {};
});

function onNext() {
  if (step.value === "Attract") return go("A1");
  if (step.value === "A2") return go("A3");

  // ✅ After the "Hum... intersting..." QR post-it
  if (step.value === "AssistAppLink") return go("ArrangeAppVersions");
}

function onChoice(id: string) {
  if (step.value === "A1") {
    // b3 = "Nevermind..." -> go to A4_LastAssist (AssistAppLink)
    if (id === "b3") return go("AssistAppLink");
    return go("A2");
  }

  if (step.value === "A3") {
    if (id === "scale") return go("AssessPrecise");
    return go("AssessApprox");
  }

  if (step.value === "Greetings") {
    if (id === "restart") return reset();
    return go("Bye");
  }
}


function onPick(payload: unknown) {
  // ✅ Freeze the step so it can't change mid-handler
  const s = step.value;

  // -----------------------------
  // ASSESS (approx) -> ASSIST
  // -----------------------------
  if (s === "AssessApprox") {
    const p = String(payload);

    if (p === "notYet" || p === "not_yet" || p === "b1") {
      go("AssistWithdrawal");
      return;
    }

    if (p === "oneDay" || p === "one_day" || p === "b2") {
      go("AssistSupport"); // ✅ Hesitant
      return;
    }

    if (p === "soon" || p === "b3") {
      go("AssistPlan");
      return;
    }

    return;
  }

  // -----------------------------
  // ASSESS (precise) -> ASSIST
  // -----------------------------
  if (s === "AssessPrecise") {
    const lvl = Number(payload);
    if (!Number.isFinite(lvl)) return;

    if (lvl <= 1) return go("AssistWithdrawal");
    if (lvl <= 5) return go("AssistSupport");
    return go("AssistPlan");
  }

  // -----------------------------
  // AssistWithdrawal (pharmacie/stop/cipret) -> LastAssist (AppLink)
  // -----------------------------
  if (s === "AssistWithdrawal") {
    const p = String(payload);
    if (p === "pharmacie" || p === "stop" || p === "cipret") {
      offerFilter.value = p; // keep if you need later
      go("AssistAppLink");
    }
    return;
  }

  // -----------------------------
  // Hesitant: peer/face -> offers, other -> app versions
  // -----------------------------
  if (s === "AssistSupport") {
    const p = String(payload);

    if (p === "other") {
      go("ArrangeAppVersions");
      return;
    }

    if (p === "peer" || p === "face") {
      offerFilter.value = p;
      go("ArrangeOffersFiltred");
      return;
    }

    // ✅ ignore unexpected payloads (prevents accidental jumps)
    return;
  }

  // -----------------------------
  // Ready: choose persona -> app versions
  // -----------------------------
  if (s === "AssistPlan") {
    if (payload === "expert" || payload === "smoker" || payload === "future") {
      agent.value = payload;
      go("ArrangeAppVersions");
    }
    return;
  }

  // -----------------------------
  // App versions -> QR
  // -----------------------------
  if (s === "ArrangeAppVersions") {
    if (payload === "expert" || payload === "smoker" || payload === "future") {
      agent.value = payload;
      go("ArrangeQr");
    }
    return;
  }
}

</script>

<style scoped>
.dev {
  position: absolute;
  left: 18px;
  bottom: 18px;
  background: rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.18);
  padding: 10px 12px;
  border-radius: 14px;
  color: #fff;
  display: grid;
  gap: 8px;
  width: 260px;
}
.devTitle { font-weight: 900; font-size: 12px; opacity: .9; }
select, button { padding: 8px; border-radius: 10px; border: none; }
button { cursor: pointer; font-weight: 900; }
</style>
