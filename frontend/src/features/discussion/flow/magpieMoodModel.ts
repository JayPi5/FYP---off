import type { FlowCommand, FlowState } from "./discussionFlowModel";

/** 0 = sad/low, 1 = mid, 2 = happiest within the community tier. */
export type SessionMood = 0 | 1 | 2;

export const SESSION_MOOD_MIN = 0;
export const SESSION_MOOD_MAX = 2;

export function clampSessionMood(value: number): SessionMood {
  if (value <= SESSION_MOOD_MIN) return SESSION_MOOD_MIN;
  if (value >= SESSION_MOOD_MAX) return SESSION_MOOD_MAX;
  return value as SessionMood;
}

/** True when the user dismisses help at A1 (b3). */
export function isRefusedHelpCommand(before: FlowState, cmd: FlowCommand): boolean {
  return cmd.kind === "choice" && before.step === "A1" && cmd.id === "b3";
}

/** Mood only rises during a session — helpful answers nudge the bird upward. */
export function moodDeltaForCommand(before: FlowState, cmd: FlowCommand): number {
  if (isRefusedHelpCommand(before, cmd)) return 0;

  if (cmd.kind === "choice") {
    if (before.step === "A1") {
      return cmd.id === "b1" ? 1 : 0;
    }
    if (before.step === "A3") {
      return 1;
    }
  }

  if (cmd.kind === "pick") {
    if (before.step === "AssessApprox") {
      const p = String(cmd.payload);
      if (p === "soon" || p === "b3") return 2;
      if (p === "oneDay" || p === "one_day" || p === "b2") return 1;
      return 0;
    }

    if (before.step === "AssessPrecise") {
      const lvl = Number(cmd.payload);
      if (!Number.isFinite(lvl)) return 0;
      if (lvl >= 6) return 2;
      if (lvl >= 2) return 1;
      return 0;
    }

    if (
      before.step === "AssistWithdrawal" ||
      before.step === "AssistSupport" ||
      before.step === "AssistPlan" ||
      before.step === "ArrangeAppVersions"
    ) {
      return 1;
    }
  }

  return 0;
}
