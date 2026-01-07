export type CommunityEventType =
  | "SESSION_START"
  | "FIVEA_COMPLETED"
  | "OFFER_PROPOSED"
  | "QR_INTENT";

export type CommunityEvent = {
  id: string;
  ts: number;
  type: CommunityEventType;
  offerId?: string;
  scenarioId?: string;
};

const LS_KEY = "smokwit.community.events.v1";

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function loadEvents(): CommunityEvent[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as CommunityEvent[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveEvents(events: CommunityEvent[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(events.slice(-5000))); // cap
}

export function logEvent(e: Omit<CommunityEvent, "id" | "ts"> & { ts?: number }) {
  const events = loadEvents();
  events.push({
    id: uid(),
    ts: e.ts ?? Date.now(),
    type: e.type,
    offerId: e.offerId,
    scenarioId: e.scenarioId,
  });
  saveEvents(events);
}

export function computeLast24h(now = Date.now()) {
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const events = loadEvents().filter(e => e.ts >= dayAgo);

  const breathing = events.filter(e => e.type === "FIVEA_COMPLETED").length;
  const humanSupport =
    events.filter(e => e.type === "OFFER_PROPOSED").length +
    2 * events.filter(e => e.type === "QR_INTENT").length; // bonus
  const nest = events.filter(e => e.type === "SESSION_START").length;

  // Simple thresholds (tune later)
  const led =
    breathing >= 6 && humanSupport >= 6 ? "green" :
    breathing >= 2 || humanSupport >= 2 ? "orange" :
    "red";

  return { breathing, humanSupport, nest, led, eventsCount: events.length };
}
