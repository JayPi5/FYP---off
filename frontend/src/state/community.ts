import { computed, ref } from "vue";



export type LedState = "green" | "orange" | "red";

export const stats = ref({
  completed5A_24h: 0,
  offers_24h: 0,
  scans_24h: 0,
  abandons_24h: 0,
  help_events_8h: 0,
  help_percent_8h: 0,
});

export const gauges = ref({
  respiration: 0,
  support: 0,
});

export function computeLed(s: typeof stats.value): LedState {
  const p = Math.max(0, Math.min(100, s.help_percent_8h));
  if (p >= 71) return "green";
  if (p >= 31) return "orange";
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
  gauges.value.support = Math.max(0, Math.min(100, stats.value.help_percent_8h));
}


export function bumpRespiration(amount = 5): void {
  gauges.value.respiration = Math.max(0, Math.min(100, gauges.value.respiration + amount));
}


export function bumpSupport(amount = 5): void {
  gauges.value.support = Math.max(0, Math.min(100, gauges.value.support + amount));
}

export function seedDemoValues(kind: "red" | "orange" | "green" = "red"): void {
  if (kind === "red") {
    stats.value = {
      completed5A_24h: 0,
      offers_24h: 0,
      scans_24h: 0,
      abandons_24h: 6,
      help_events_8h: 4,
      help_percent_8h: 20,
    };
  } else if (kind === "orange") {
    stats.value = {
      completed5A_24h: 2,
      offers_24h: 0,
      scans_24h: 1,
      abandons_24h: 2,
      help_events_8h: 10,
      help_percent_8h: 50,
    };
  } else {
    stats.value = {
      completed5A_24h: 6,
      offers_24h: 4,
      scans_24h: 2,
      abandons_24h: 1,
      help_events_8h: 18,
      help_percent_8h: 90,
    };
  }

  recomputeGauges();
}
