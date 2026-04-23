import type { Component } from "vue";
import { computed, ref } from "vue";
import { postHelpEvent } from "@/services/api";

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

  function dispatch(cmd: FlowCommand) {
    const before = flow.value;
    const after = applyCommand(before, cmd);
    flow.value = after;
    trackHelpEvent(before.step, after.step);
  }

  function trackHelpEvent(from: StepId, to: StepId) {
    if (from === to) return;

    let eventKind: "assist" | "offers" | "app_link" | "session_complete" | null = null;

    if (to === "AssistWithdrawal" || to === "AssistSupport" || to === "AssistPlan") {
      eventKind = "assist";
    } else if (to === "ArrangeOffersFiltred") {
      eventKind = "offers";
    } else if (to === "ArrangeAppVersions" || to === "ArrangeQr") {
      eventKind = "app_link";
    } else if (to === "Greetings") {
      eventKind = "session_complete";
    }

    if (eventKind) {
      void postHelpEvent({ event_kind: eventKind }).catch(() => {});
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
    reset: () => dispatch({ kind: "reset" }),
  };
}
