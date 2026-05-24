import type { AgentPersona } from "@/features/discussion/flow/discussionFlowModel";

export type QrOfferKey = "pharmacie" | "stop" | "cipret" | "peer" | "face";

/** Mirrors backend/data/qr_destinations.json */
export const QR_DESTINATIONS = {
  default: "https://smokwit.ch/map",
  agents: {
    expert: "https://smokwit.ch/coaching",
    smoker: "https://tribu.stop-tabac.ch/",
    future: "https://tools.stop-tabac.ch/",
  },
  offers: {
    pharmacie: "https://www.pharmacieplus.ch/prestations/stop-tabac/",
    stop: "https://www.stop-tabac.ch/",
    cipret: "https://www.vivre-sans-fumer.ch/",
    peer: "https://tribu.stop-tabac.ch/",
    face: "https://www.vivre-sans-fumer.ch/",
  },
} as const;

const AGENT_LABELS: Record<AgentPersona, string> = {
  expert: "Agent: Smoking Cessation Expert",
  smoker: "Agent: Someone who smokes",
  future: "Agent: Future You",
};

const OFFER_LABELS: Record<QrOfferKey, string> = {
  pharmacie: "Pharmacie Plus — Stop tabac",
  stop: "stop-tabac.ch",
  cipret: "CIPRET Neuchâtel — Vivre sans fumer",
  peer: "stop-tabac.ch — Tribu (peer support)",
  face: "CIPRET — coaching face à face",
};

export type QrTarget = {
  /** Tracking URL scanned by the phone (logs scan, then redirects). */
  trackingUrl: string;
  /** Final destination after redirect (for display/debug). */
  destinationUrl: string;
  label: string;
};

function isOfferKey(x: string): x is QrOfferKey {
  return x in QR_DESTINATIONS.offers;
}

export function buildQrTrackingPath(params: {
  totemId: string;
  agent?: AgentPersona | null;
  offerFilter?: string | null;
}): { path: string; destinationUrl: string; label: string } {
  const totem = encodeURIComponent(params.totemId);
  const agent = params.agent ?? null;
  const rawOffer = (params.offerFilter ?? "").trim().toLowerCase();

  if (agent) {
    return {
      path: `/qr/${totem}?agent=${encodeURIComponent(agent)}`,
      destinationUrl: QR_DESTINATIONS.agents[agent],
      label: AGENT_LABELS[agent],
    };
  }

  if (rawOffer && isOfferKey(rawOffer)) {
    return {
      path: `/qr/${totem}?destination=${encodeURIComponent(rawOffer)}`,
      destinationUrl: QR_DESTINATIONS.offers[rawOffer],
      label: OFFER_LABELS[rawOffer],
    };
  }

  return {
    path: `/qr/${totem}`,
    destinationUrl: QR_DESTINATIONS.default,
    label: "Smokwit community map",
  };
}

export function resolveQrTarget(input: {
  apiBase: string;
  totemId: string;
  agent?: AgentPersona | null;
  offerFilter?: string | null;
}): QrTarget {
  const base = input.apiBase.replace(/\/$/, "");
  const { path, destinationUrl, label } = buildQrTrackingPath({
    totemId: input.totemId,
    agent: input.agent,
    offerFilter: input.offerFilter,
  });
  return {
    trackingUrl: `${base}${path}`,
    destinationUrl,
    label,
  };
}
