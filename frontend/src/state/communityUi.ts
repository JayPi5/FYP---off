import { computed } from "vue";
import type { LedState } from "./community";
import { ledState } from "./community";
import type { SessionMood } from "@/features/discussion/flow/magpieMoodModel";
import { sessionMood } from "./sessionMood";

import magpieGreen from "../assets/magpie_green.png";
import magpieOrangeSad from "../assets/magpie_orange_sad.png";
import magpieOrange from "../assets/magpie_orange.png";
import magpieOrangeHappy from "../assets/magpie_orange_happy.png";
import magpieRed from "../assets/magpie_red.png";
import magpieRedHope1 from "../assets/magpie_red_hope1.png";
import magpieRedHope2 from "../assets/magpie_red_hope2.png";

const RED_BY_MOOD = [magpieRed, magpieRedHope1, magpieRedHope2] as const;
const ORANGE_BY_MOOD = [magpieOrangeSad, magpieOrange, magpieOrangeHappy] as const;

export function pickMagpieAsset(tier: LedState, mood: SessionMood): string {
  const idx = Math.max(0, Math.min(2, mood)) as SessionMood;
  if (tier === "green") return magpieGreen;
  if (tier === "orange") return ORANGE_BY_MOOD[idx] ?? magpieOrange;
  return RED_BY_MOOD[idx] ?? magpieRed;
}

/**
 * Community tier (red/orange/green) × session mood (sad → hopeful within tier).
 * Green tier still uses a single asset until more variants exist.
 */
export const magpieSrc = computed<string>(() =>
  pickMagpieAsset(ledState.value, sessionMood.value)
);
