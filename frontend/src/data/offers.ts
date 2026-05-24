export type OfferIntensity = "faible" | "moyen" | "forte";

export interface OfferLink {
  label: string;
  url: string;
}

export interface Offer {
  id: string;
  actor: string;
  type: string;
  accessibility: string;
  publicTarget: string;
  price: string;
  intensity: OfferIntensity;
  links?: OfferLink[];
}

export type OfferFilter = "all" | "recommended" | "peer" | "face" | "expert" | "digital";

export function filterOffers(filter: OfferFilter, all: Offer[]): Offer[] {
  if (filter === "all") return all;

  const isPeer = (o: Offer) =>
    o.type.toLowerCase().includes("peer") ||
    o.type.toLowerCase().includes("groupe");

  const isFace = (o: Offer) =>
    o.type.toLowerCase().includes("coaching individuel") &&
    !o.type.toLowerCase().includes("app") &&
    !o.accessibility.toLowerCase().includes("online");

  const isExpert = (o: Offer) =>
    o.type.toLowerCase().includes("coaching individuel") ||
    o.type.toLowerCase().includes("conseil téléphonique") ||
    o.type.toLowerCase().includes("information");

  const isDigital = (o: Offer) =>
    o.accessibility.toLowerCase().includes("online") ||
    o.type.toLowerCase().includes("app") ||
    o.type.toLowerCase().includes("self-help");

  const isRecommended = (o: Offer) => {
    const free = o.price.toLowerCase().includes("gratuit") || o.price.includes("0 CHF");
    const easy = o.intensity === "faible";
    return free || easy;
  };

  const predicate =
    filter === "peer" ? isPeer :
    filter === "face" ? isFace :
    filter === "expert" ? isExpert :
    filter === "digital" ? isDigital :
    isRecommended;

  return all.filter(predicate);
}
