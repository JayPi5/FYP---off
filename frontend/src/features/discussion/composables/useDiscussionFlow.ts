import type { Component } from "vue";
import { computed, ref } from "vue";
import { postHelpEvent } from "@/shared/services/api";
import { moodDeltaForCommand, isRefusedHelpCommand } from "../flow/magpieMoodModel";
import {
  analyticsEventsForTransition,
  shouldLogAbandonOnReset,
} from "../flow/discussionAnalytics";
import {
  applySessionMoodDelta,
  markSessionRefusedHelp,
  resetSessionMood,
} from "@/shared/state/sessionMood";

import {
  applyCommand,
  DISCUSSION_STEPS,
  initialFlowState,
  type FlowCommand,
  type FlowState,
  type StepId,
} from "../flow/discussionFlowModel";

import Attract from "@/features/discussion/steps/Not_5A/Attract.vue";
import A1 from "@/features/discussion/steps/A1_Ask/A1_Ask.vue";
import A2 from "@/features/discussion/steps/A2_Advise/A2_Advise.vue";
import A3 from "@/features/discussion/steps/A3_Assess/A3_Assess.vue";
import AssessApprox from "@/features/discussion/steps/A3_Assess/A3_3choices.vue";
import AssessPrecise from "@/features/discussion/steps/A3_Assess/A3_RTQ.vue";
import AssistWithdrawal from "@/features/discussion/steps/A4_Assist/A4_NotReady.vue";
import AssistSupport from "@/features/discussion/steps/A4_Assist/A4_Hesitant.vue";
import AssistPlan from "@/features/discussion/steps/A4_Assist/A4_Ready.vue";
import AssistAppLink from "@/features/discussion/steps/A4_Assist/A4_LastAssist.vue";
import ArrangeOffersFiltred from "@/features/discussion/steps/A5_Arrange/ArrangeOffersFiltred.vue";
import ArrangeAppVersions from "@/features/discussion/steps/A5_Arrange/A5_HEGxUniNE.vue";
import ArrangeQr from "@/features/discussion/steps/A5_Arrange/A5_SmokwitQR.vue";
import Greetings from "@/features/discussion/steps/Not_5A/Greetings.vue";
import Bye from "@/features/discussion/steps/Not_5A/Bye.vue";

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

function fireHelpEvent(event_kind: Parameters<typeof postHelpEvent>[0]["event_kind"], points?: number) {
  void postHelpEvent({ event_kind, points }).catch(() => {});
}

export function useDiscussionFlow() {
  const flow = ref<FlowState>({
    step: initialFlowState.step,
    context: { ...initialFlowState.context },
  });
  const sentProgressLevel = ref<number>(0);
  const completedSession = ref(false);

  function dispatch(cmd: FlowCommand) {
    const before = flow.value;
    const after = applyCommand(before, cmd);
    flow.value = after;
    if (isRefusedHelpCommand(before, cmd)) markSessionRefusedHelp();
    applySessionMoodDelta(moodDeltaForCommand(before, cmd));
    trackHelpProgress(before.step, after.step);
    trackAnalytics(before.step, after.step);
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
      fireHelpEvent("progress", delta);
    }
  }

  function trackAnalytics(from: StepId, to: StepId) {
    if (from === to) return;
    for (const event of analyticsEventsForTransition(from, to)) {
      if (event.event_kind === "session_complete") completedSession.value = true;
      fireHelpEvent(event.event_kind);
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
    if (s === "ArrangeQr") return { agent: ctx.agent, offerFilter: ctx.offerFilter };
    if (s === "AssistAppLink") return { offerFilter: ctx.offerFilter };
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
      if (shouldLogAbandonOnReset(sentProgressLevel.value, completedSession.value)) {
        fireHelpEvent("abandon");
      }
      sentProgressLevel.value = 0;
      completedSession.value = false;
      resetSessionMood();
      dispatch({ kind: "reset" });
    },
  };
}
