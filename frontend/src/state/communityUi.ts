// src/state/communityUi.ts
import { computed } from "vue";
import { ledState } from "./community";

import magpieGreen from "../assets/magpie_green.png";
import magpieOrange from "../assets/magpie_orange.png";
import magpieRed from "../assets/magpie_red.png";

/**
 * ✅ Single source of truth for magpie image selection.
 * UI concern (assets) is intentionally separated from community domain logic.
 */
export const magpieSrc = computed<string>(() => {
  if (ledState.value === "green") return magpieGreen;
  if (ledState.value === "orange") return magpieOrange;
  return magpieRed;
});
