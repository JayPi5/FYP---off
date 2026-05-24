import type { StepId } from "./discussionFlowModel";

export type AnalyticsEventKind =
  | "offers"
  | "app_link"
  | "session_complete"
  | "abandon";

export type AnalyticsEvent = { event_kind: AnalyticsEventKind };

const ENTRY_EVENTS: Partial<Record<StepId, AnalyticsEventKind>> = {
  ArrangeOffersFiltred: "offers",
  AssistAppLink: "app_link",
  Greetings: "session_complete",
};

export function analyticsEventsForTransition(from: StepId, to: StepId): AnalyticsEvent[] {
  if (from === to) return [];

  const events: AnalyticsEvent[] = [];
  const entryKind = ENTRY_EVENTS[to];
  if (entryKind) events.push({ event_kind: entryKind });
  return events;
}

export function shouldLogAbandonOnReset(progressLevel: number, completedSession: boolean): boolean {
  return progressLevel > 0 && !completedSession && progressLevel < 5;
}
