import { describe, expect, it } from "vitest";
import {
  analyticsEventsForTransition,
  shouldLogAbandonOnReset,
} from "@/features/discussion/flow/discussionAnalytics";

describe("discussionAnalytics", () => {
  it("logs session_complete when reaching Greetings", () => {
    expect(analyticsEventsForTransition("ArrangeQr", "Greetings")).toEqual([
      { event_kind: "session_complete" },
    ]);
  });

  it("logs offers when opening filtered offers step", () => {
    expect(analyticsEventsForTransition("AssistSupport", "ArrangeOffersFiltred")).toEqual([
      { event_kind: "offers" },
    ]);
  });

  it("logs app_link when opening assist app link step", () => {
    expect(analyticsEventsForTransition("A1", "AssistAppLink")).toEqual([
      { event_kind: "app_link" },
    ]);
  });

  it("returns no analytics event for neutral transitions", () => {
    expect(analyticsEventsForTransition("A1", "A2")).toEqual([]);
  });

  it("flags abandon on reset when flow started but not completed", () => {
    expect(shouldLogAbandonOnReset(2, false)).toBe(true);
    expect(shouldLogAbandonOnReset(5, true)).toBe(false);
    expect(shouldLogAbandonOnReset(0, false)).toBe(false);
  });
});
