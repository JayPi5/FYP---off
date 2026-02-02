import { computed, ref } from "vue";

export type AssessMethod = "precise" | "approx";
export type ApproxChoice = "notYet" | "oneDay" | "soon";
export type ReadinessBranch = "withdrawal" | "support" | "plan";

export type SupportPref = "peer" | "face" | "other";
export type PlanPref = "expert" | "smoker" | "future";
export type AppPersona = "expert" | "smoker" | "future";

export type OfferFilter = "all" | "recommended" | "peer" | "face" | "expert" | "digital";

export const assessMethod = ref<AssessMethod | null>(null);

// Precise readiness (1..10)
export const readinessScore = ref<number | null>(null);

// Approx readiness (3 buttons)
export const approxChoice = ref<ApproxChoice | null>(null);

// Support selection
export const supportPref = ref<SupportPref | null>(null);

// Plan selection
export const planPref = ref<PlanPref | null>(null);

// App persona selection (3 versions)
export const appPersona = ref<AppPersona | null>(null);

// Which filter we want when showing filtered offers
export const offersFilter = ref<OfferFilter>("recommended");

export const readinessBranch = computed<ReadinessBranch | null>(() => {
  if (assessMethod.value === "precise" && readinessScore.value != null) {
    const v = readinessScore.value;
    if (v <= 1) return "withdrawal";     // L1
    if (v <= 5) return "support";        // L2..L5
    return "plan";                       // L6..L10
  }

  if (assessMethod.value === "approx" && approxChoice.value != null) {
    if (approxChoice.value === "notYet") return "withdrawal";
    if (approxChoice.value === "oneDay") return "support";
    return "plan";
  }

  return null;
});

export function resetDiscussion() {
  assessMethod.value = null;
  readinessScore.value = null;
  approxChoice.value = null;
  supportPref.value = null;
  planPref.value = null;
  appPersona.value = null;
  offersFilter.value = "recommended";
}
