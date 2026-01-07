export type Offer = {
  id: string;
  name: string;
  region?: string;
  type: string;
  target?: string;
  price?: string;
  intensity?: "low" | "medium" | "high";
  url?: string;
  notes?: string;
};

export const OFFERS: Offer[] = [
  {
    id: "cipret",
    name: "CIPRET – Vivre sans fumer",
    region: "NE",
    type: "Coaching / orientation",
    intensity: "high",
    url: "https://www.vivre-sans-fumer.ch/",
    notes: "Coaching + orientation (local).",
  },
  {
    id: "ligue_ne",
    name: "Ligue pulmonaire – NE",
    region: "NE",
    type: "Coaching individuel",
    intensity: "high",
    notes: "Programme avec suivi (local).",
  },
  {
    id: "ligue_ch",
    name: "Ligue pulmonaire – CH",
    region: "CH",
    type: "App + coaching / programmes",
    intensity: "medium",
    notes: "Option nationale (app / programmes).",
  },
  {
    id: "stop_tabac",
    name: "stop-tabac.ch",
    region: "CH",
    type: "Conseil / self-help",
    intensity: "low",
    url: "https://stop-tabac.ch/",
    notes: "Infos + ressources + aides (national).",
  },
  {
    id: "mois_sans_tabac",
    name: "Mois-sans-tabac.ch",
    region: "CH",
    type: "Challenge / coaching",
    intensity: "low",
    url: "https://mois-sans-tabac.ch/",
    notes: "Défi + supports (saisonnier).",
  },
  {
    id: "safezone",
    name: "SafeZone.ch",
    region: "CH",
    type: "Consultation en ligne",
    intensity: "medium",
    url: "https://www.safezone.ch/",
    notes: "Orientation / consultations (en ligne).",
  },
];
