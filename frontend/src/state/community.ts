import { computed, ref } from "vue";



export type LedState = "green" | "orange" | "red";

export const stats = ref({
  completed5A_24h: 0,
  offers_24h: 0,
  scans_24h: 0,
  abandons_24h: 0,
});

export const gauges = ref({
  respiration: 0,
  support: 0,
});

export function computeLed(s: typeof stats.value): LedState {
  const strong = s.completed5A_24h + s.offers_24h + s.scans_24h;
  if (strong >= 10 || (s.completed5A_24h >= 5 && s.offers_24h >= 3)) return "green";
  if (strong >= 3) return "orange";
  return "red";
}

export const ledState = computed<LedState>(() => computeLed(stats.value));

export const ledLabel = computed(() => {
  if (ledState.value === "red") return "ROUGE";
  if (ledState.value === "orange") return "ORANGE";
  return "VERTE";
});



export function recomputeGauges(): void {
  gauges.value.respiration = Math.min(100, stats.value.completed5A_24h * 12);
  gauges.value.support = Math.min(100, stats.value.offers_24h * 10 + stats.value.scans_24h * 20);
}


export function bumpRespiration(amount = 5): void {
  gauges.value.respiration = Math.max(0, Math.min(100, gauges.value.respiration + amount));
}


export function bumpSupport(amount = 5): void {
  gauges.value.support = Math.max(0, Math.min(100, gauges.value.support + amount));
}

export function seedDemoValues(kind: "red" | "orange" | "green" = "red"): void {
  if (kind === "red") {
    stats.value = { completed5A_24h: 0, offers_24h: 0, scans_24h: 0, abandons_24h: 6 };
  } else if (kind === "orange") {
    stats.value = { completed5A_24h: 2, offers_24h: 0, scans_24h: 1, abandons_24h: 2 };
  } else {
    stats.value = { completed5A_24h: 6, offers_24h: 4, scans_24h: 2, abandons_24h: 1 };
  }

  recomputeGauges();
}
