/**
 * Pure 5A discussion flow — no Vue imports (easy to unit test / reason about).
 */
export type StepId =
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

export type AgentPersona = "expert" | "smoker" | "future";

export type FlowContext = {
  offerFilter: string | null;
  agent: AgentPersona;
};

export type FlowState = {
  step: StepId;
  context: FlowContext;
};

export type FlowCommand =
  | { kind: "next" }
  | { kind: "choice"; id: string }
  | { kind: "pick"; payload: unknown }
  | { kind: "go"; step: StepId }
  | { kind: "reset" };

export const DISCUSSION_STEPS: StepId[] = [
  "Attract",
  "A1",
  "A2",
  "A3",
  "AssessApprox",
  "AssessPrecise",
  "AssistWithdrawal",
  "AssistSupport",
  "AssistPlan",
  "AssistAppLink",
  "ArrangeOffersFiltred",
  "ArrangeAppVersions",
  "ArrangeQr",
  "Greetings",
  "Bye",
];

export const initialFlowState: FlowState = {
  step: "Attract",
  context: { offerFilter: null, agent: "expert" },
};

function cloneContext(ctx: FlowContext): FlowContext {
  return { ...ctx };
}

export function applyCommand(state: FlowState, cmd: FlowCommand): FlowState {
  if (cmd.kind === "reset") {
    return { ...initialFlowState, context: cloneContext(initialFlowState.context) };
  }

  if (cmd.kind === "go") {
    return { ...state, step: cmd.step };
  }

  const { step, context: ctx } = state;

  if (cmd.kind === "next") {
    if (step === "Attract") return { ...state, step: "A1" };
    if (step === "A2") return { ...state, step: "A3" };
    if (step === "AssistAppLink") return { ...state, step: "ArrangeAppVersions" };
    return state;
  }

  if (cmd.kind === "choice") {
    const id = cmd.id;
    if (step === "A1") {
      if (id === "b3") return { ...state, step: "AssistAppLink" };
      return { ...state, step: "A2" };
    }
    if (step === "A3") {
      if (id === "scale") return { ...state, step: "AssessPrecise" };
      return { ...state, step: "AssessApprox" };
    }
    if (step === "Greetings") {
      if (id === "restart") {
        return {
          ...initialFlowState,
          context: cloneContext(initialFlowState.context),
        };
      }
      return { ...state, step: "Bye" };
    }
    return state;
  }

  if (cmd.kind === "pick") {
    const payload = cmd.payload;

    if (step === "AssessApprox") {
      const p = String(payload);
      if (p === "notYet" || p === "not_yet" || p === "b1")
        return { ...state, step: "AssistWithdrawal" };
      if (p === "oneDay" || p === "one_day" || p === "b2")
        return { ...state, step: "AssistSupport" };
      if (p === "soon" || p === "b3") return { ...state, step: "AssistPlan" };
      return state;
    }

    if (step === "AssessPrecise") {
      const lvl = Number(payload);
      if (!Number.isFinite(lvl)) return state;
      if (lvl <= 1) return { ...state, step: "AssistWithdrawal" };
      if (lvl <= 5) return { ...state, step: "AssistSupport" };
      return { ...state, step: "AssistPlan" };
    }

    if (step === "AssistWithdrawal") {
      const p = String(payload);
      if (p === "pharmacie" || p === "stop" || p === "cipret") {
        return {
          ...state,
          step: "AssistAppLink",
          context: { ...ctx, offerFilter: p },
        };
      }
      return state;
    }

    if (step === "AssistSupport") {
      const p = String(payload);
      if (p === "other") return { ...state, step: "ArrangeAppVersions" };
      if (p === "peer" || p === "face") {
        return {
          ...state,
          step: "ArrangeOffersFiltred",
          context: { ...ctx, offerFilter: p },
        };
      }
      return state;
    }

    if (step === "AssistPlan") {
      if (payload === "expert" || payload === "smoker" || payload === "future") {
        return {
          ...state,
          step: "ArrangeAppVersions",
          context: { ...ctx, agent: payload },
        };
      }
      return state;
    }

    if (step === "ArrangeAppVersions") {
      if (payload === "expert" || payload === "smoker" || payload === "future") {
        return {
          ...state,
          step: "ArrangeQr",
          context: { ...ctx, agent: payload },
        };
      }
      return state;
    }
  }

  return state;
}
