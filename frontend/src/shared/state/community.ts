import { computed, ref } from "vue";
import { COMMUNITY_CONFIG } from "@/shared/config/communityConfig";

export type LedState = "green" | "orange" | "red";

export const stats = ref({
  completed5A_24h: 0,
  offers_24h: 0,
  scans_24h: 0,
  abandons_24h: 0,
  scans_8h: 0,
  scan_percent_8h: 0,
  help_points_8h: 0,
  help_percent_8h: 0,
});

export const gauges = ref({
  respiration: 0,
  support: 0,
});

export function computeLed(s: typeof stats.value): LedState {
  const p = Math.max(0, Math.min(100, s.help_percent_8h));
  if (p >= COMMUNITY_CONFIG.ledGreenMinPercent) return "green";
  if (p >= COMMUNITY_CONFIG.ledOrangeMinPercent) return "orange";
  return "red";
}

export const ledState = computed<LedState>(() => computeLed(stats.value));

export const ledLabel = computed(() => {
  if (ledState.value === "red") return "ROUGE";
  if (ledState.value === "orange") return "ORANGE";
  return "VERTE";
});

export function recomputeGauges(): void {
  gauges.value.respiration = Math.max(0, Math.min(100, stats.value.scan_percent_8h));
  gauges.value.support = Math.max(0, Math.min(100, stats.value.help_percent_8h));
}
