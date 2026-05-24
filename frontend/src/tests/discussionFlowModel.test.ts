import { describe, expect, it } from "vitest";

import { applyCommand, initialFlowState } from "@/features/discussion/flow/discussionFlowModel";
import { computeLed } from "@/shared/state/community";

describe("discussion flow model", () => {
  it("routes A1 b3 directly to AssistAppLink", () => {
    const a1 = applyCommand(initialFlowState, { kind: "next" });
    const out = applyCommand(a1, { kind: "choice", id: "b3" });
    expect(out.step).toBe("AssistAppLink");
  });

  it("maps precise assess levels to correct assist branch", () => {
    const precise = { ...initialFlowState, step: "AssessPrecise" as const };
    expect(applyCommand(precise, { kind: "pick", payload: 1 }).step).toBe("AssistWithdrawal");
    expect(applyCommand(precise, { kind: "pick", payload: 4 }).step).toBe("AssistSupport");
    expect(applyCommand(precise, { kind: "pick", payload: 9 }).step).toBe("AssistPlan");
  });

  it("keeps support context when selecting peer/face", () => {
    const support = { ...initialFlowState, step: "AssistSupport" as const };
    const out = applyCommand(support, { kind: "pick", payload: "peer" });
    expect(out.step).toBe("ArrangeOffersFiltred");
    expect(out.context.offerFilter).toBe("peer");
  });
});

describe("community LED thresholds", () => {
  const base = {
    completed5A_24h: 0,
    offers_24h: 0,
    scans_24h: 0,
    abandons_24h: 0,
    scans_8h: 0,
    scan_percent_8h: 0,
    help_points_8h: 0,
    help_percent_8h: 0,
  };

  it("is red below 31%", () => {
    expect(computeLed({ ...base, help_percent_8h: 30 })).toBe("red");
  });

  it("is orange between 31% and 70%", () => {
    expect(computeLed({ ...base, help_percent_8h: 31 })).toBe("orange");
    expect(computeLed({ ...base, help_percent_8h: 70 })).toBe("orange");
  });

  it("is green at 71% and above", () => {
    expect(computeLed({ ...base, help_percent_8h: 71 })).toBe("green");
    expect(computeLed({ ...base, help_percent_8h: 99 })).toBe("green");
  });
});
