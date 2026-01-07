const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://127.0.0.1:8000";
const TOTEM_ID = (import.meta.env.VITE_TOTEM_ID as string | undefined) ?? "TOTEM_001";

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export type Mode = "quiz" | "discussion" | "chatbot";

export function makeSessionId() {
  // stable enough for kiosk tests
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function logTelemetry(
  mode: Mode,
  eventType: string,
  sessionId: string,
  extras?: { scenarioId?: string; offerId?: string }
) {
  const res = await fetch(joinUrl(API_BASE, "/api/telemetry/event"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      totem_id: TOTEM_ID,
      mode,
      event_type: eventType,
      session_id: sessionId,
      scenario_id: extras?.scenarioId,
      offer_id: extras?.offerId,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Telemetry failed: HTTP ${res.status} ${res.statusText} - ${text}`);
  }

  return (await res.json()) as { ok: boolean };
}
