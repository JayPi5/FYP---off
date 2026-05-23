import type { Component } from "vue";
import { computed, ref } from "vue";
import { postHelpEvent } from "@/services/api";
import { moodDeltaForCommand } from "../flow/magpieMoodModel";
import { applySessionMoodDelta, resetSessionMood } from "@/state/sessionMood";

import {
  applyCommand,
  DISCUSSION_STEPS,
  initialFlowState,
  type FlowCommand,
  type FlowState,
  type StepId,
} from "../flow/discussionFlowModel";

import Attract from "@/pages/discussions/steps/Not_5A/Attract.vue";
import A1 from "@/pages/discussions/steps/A1_Ask/A1_Ask.vue";
import A2 from "@/pages/discussions/steps/A2_Advise/A2_Advise.vue";
import A3 from "@/pages/discussions/steps/A3_Assess/A3_Assess.vue";
import AssessApprox from "@/pages/discussions/steps/A3_Assess/A3_3choices.vue";
import AssessPrecise from "@/pages/discussions/steps/A3_Assess/A3_RTQ.vue";
import AssistWithdrawal from "@/pages/discussions/steps/A4_Assist/A4_NotReady.vue";
import AssistSupport from "@/pages/discussions/steps/A4_Assist/A4_Hesitant.vue";
import AssistPlan from "@/pages/discussions/steps/A4_Assist/A4_Ready.vue";
import AssistAppLink from "@/pages/discussions/steps/A4_Assist/A4_LastAssist.vue";
import ArrangeOffersFiltred from "@/pages/discussions/steps/A5_Arrange/ArrangeOffersFiltred.vue";
import ArrangeAppVersions from "@/pages/discussions/steps/A5_Arrange/A5_HEGxUniNE.vue";
import ArrangeQr from "@/pages/discussions/steps/A5_Arrange/A5_SmokwitQR.vue";
import Greetings from "@/pages/discussions/steps/Not_5A/Greetings.vue";
import Bye from "@/pages/discussions/steps/Not_5A/Bye.vue";

const STEP_COMPONENTS: Record<StepId, Component> = {
  Attract,
  A1,
  A2,
  A3,
  AssessApprox,
  AssessPrecise,
  AssistWithdrawal,
  AssistSupport,
  AssistPlan,
  AssistAppLink,
  ArrangeOffersFiltred,
  ArrangeAppVersions,
  ArrangeQr,
  Greetings,
  Bye,
};

export function useDiscussionFlow() {
  const flow = ref<FlowState>({
    step: initialFlowState.step,
    context: { ...initialFlowState.context },
  });
  const sentProgressLevel = ref<number>(0);

  function dispatch(cmd: FlowCommand) {
    const before = flow.value;
    const after = applyCommand(before, cmd);
    flow.value = after;
    applySessionMoodDelta(moodDeltaForCommand(before, cmd));
    trackHelpProgress(before.step, after.step);
  }

  function stepProgressLevel(stepId: StepId): number {
    if (stepId === "A2") return 1;
    if (stepId === "A3" || stepId === "AssessApprox" || stepId === "AssessPrecise") return 2;
    if (stepId === "AssistWithdrawal" || stepId === "AssistSupport" || stepId === "AssistPlan" || stepId === "AssistAppLink") return 3;
    if (stepId === "ArrangeOffersFiltred" || stepId === "ArrangeAppVersions" || stepId === "ArrangeQr") return 4;
    if (stepId === "Greetings" || stepId === "Bye") return 5;
    return 0;
  }

  function trackHelpProgress(from: StepId, to: StepId) {
    if (from === to) return;
    const nextLevel = stepProgressLevel(to);
    const delta = nextLevel - sentProgressLevel.value;
    if (delta > 0) {
      sentProgressLevel.value = nextLevel;
      void postHelpEvent({ event_kind: "progress", points: delta }).catch(() => {});
    }
  }

  const step = computed({
    get: () => flow.value.step,
    set: (s: StepId) => dispatch({ kind: "go", step: s }),
  });

  const Current = computed(() => STEP_COMPONENTS[flow.value.step]);

  const currentProps = computed(() => {
    const { step: s, context: ctx } = flow.value;
    if (s === "ArrangeOffersFiltred") return { filterKey: ctx.offerFilter };
    if (s === "ArrangeQr") return { agent: ctx.agent };
    return {};
  });

  return {
    allSteps: DISCUSSION_STEPS,
    step,
    Current,
    currentProps,
    onNext: () => dispatch({ kind: "next" }),
    onChoice: (id: string) => dispatch({ kind: "choice", id }),
    onPick: (payload: unknown) => dispatch({ kind: "pick", payload }),
    go: (s: StepId) => dispatch({ kind: "go", step: s }),
    reset: () => {
      sentProgressLevel.value = 0;
      resetSessionMood();
      dispatch({ kind: "reset" });
    },
  };
}
