import { describe, expect, it } from "vitest";
import {
  initialFlowState,
  type FlowState,
} from "@/features/discussion/flow/discussionFlowModel";
import {
  clampSessionMood,
  isRefusedHelpCommand,
  moodDeltaForCommand,
} from "@/features/discussion/flow/magpieMoodModel";
import { pickMagpieAsset } from "@/shared/state/communityUi";

import magpieOrangeSad from "@/assets/magpie_orange_sad.png";
import magpieOrange from "@/assets/magpie_orange.png";
import magpieOrangeHappy from "@/assets/magpie_orange_happy.png";
import magpieRed from "@/assets/magpie_red.png";
import magpieRedHope1 from "@/assets/magpie_red_hope1.png";
import magpieRedHope2 from "@/assets/magpie_red_hope2.png";
import magpieGreen from "@/assets/magpie_green.png";
import magpieGreenSad from "@/assets/magpie_green_sad.png";

function atStep(step: FlowState["step"]): FlowState {
  return { ...initialFlowState, step };
}

describe("clampSessionMood", () => {
  it("clamps to 0..2", () => {
    expect(clampSessionMood(-1)).toBe(0);
    expect(clampSessionMood(0)).toBe(0);
    expect(clampSessionMood(1)).toBe(1);
    expect(clampSessionMood(2)).toBe(2);
    expect(clampSessionMood(9)).toBe(2);
  });
});

describe("isRefusedHelpCommand", () => {
  it("detects A1 dismissive choice", () => {
    expect(isRefusedHelpCommand(atStep("A1"), { kind: "choice", id: "b3" })).toBe(true);
    expect(isRefusedHelpCommand(atStep("A1"), { kind: "choice", id: "b1" })).toBe(false);
  });
});

describe("moodDeltaForCommand", () => {
  it("rewards engaging at A1", () => {
    expect(moodDeltaForCommand(atStep("A1"), { kind: "choice", id: "b1" })).toBe(1);
    expect(moodDeltaForCommand(atStep("A1"), { kind: "choice", id: "b3" })).toBe(0);
  });

  it("rewards readiness answers", () => {
    expect(
      moodDeltaForCommand(atStep("AssessApprox"), { kind: "pick", payload: "notYet" })
    ).toBe(0);
    expect(
      moodDeltaForCommand(atStep("AssessApprox"), { kind: "pick", payload: "oneDay" })
    ).toBe(1);
    expect(
      moodDeltaForCommand(atStep("AssessApprox"), { kind: "pick", payload: "soon" })
    ).toBe(2);
  });

  it("rewards higher RTQ scores", () => {
    expect(
      moodDeltaForCommand(atStep("AssessPrecise"), { kind: "pick", payload: 1 })
    ).toBe(0);
    expect(
      moodDeltaForCommand(atStep("AssessPrecise"), { kind: "pick", payload: 4 })
    ).toBe(1);
    expect(
      moodDeltaForCommand(atStep("AssessPrecise"), { kind: "pick", payload: 8 })
    ).toBe(2);
  });
});

describe("pickMagpieAsset", () => {
  it("maps red moods sad → hope1 → hope2", () => {
    expect(pickMagpieAsset("red", 0)).toBe(magpieRed);
    expect(pickMagpieAsset("red", 1)).toBe(magpieRedHope1);
    expect(pickMagpieAsset("red", 2)).toBe(magpieRedHope2);
  });

  it("maps orange moods sad → normal → happy", () => {
    expect(pickMagpieAsset("orange", 0)).toBe(magpieOrangeSad);
    expect(pickMagpieAsset("orange", 1)).toBe(magpieOrange);
    expect(pickMagpieAsset("orange", 2)).toBe(magpieOrangeHappy);
  });

  it("uses happy green by default and sad green when help was refused", () => {
    expect(pickMagpieAsset("green", 0, false)).toBe(magpieGreen);
    expect(pickMagpieAsset("green", 2, false)).toBe(magpieGreen);
    expect(pickMagpieAsset("green", 2, true)).toBe(magpieGreenSad);
  });
});
