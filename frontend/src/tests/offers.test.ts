import { describe, expect, it } from "vitest";
import { filterOffers, type Offer } from "@/data/offers";

const sample: Offer[] = [
  {
    id: "peer-1",
    actor: "stop-tabac.ch",
    type: "Peer-support (groupe)",
    accessibility: "Sur rendez-vous",
    publicTarget: "Tout public",
    price: "Gratuit",
    intensity: "faible",
  },
  {
    id: "face-1",
    actor: "CIPRET",
    type: "Coaching individuel",
    accessibility: "Sur rendez-vous",
    publicTarget: "Tout public",
    price: "Gratuit",
    intensity: "moyen",
  },
  {
    id: "digital-1",
    actor: "App",
    type: "Self-help app",
    accessibility: "Online",
    publicTarget: "Tout public",
    price: "0 CHF",
    intensity: "faible",
  },
];

describe("filterOffers", () => {
  it("returns all offers for all filter", () => {
    expect(filterOffers("all", sample)).toHaveLength(3);
  });

  it("filters peer offers", () => {
    expect(filterOffers("peer", sample).map((o) => o.id)).toEqual(["peer-1"]);
  });

  it("filters face-to-face offers", () => {
    expect(filterOffers("face", sample).map((o) => o.id)).toEqual(["face-1"]);
  });

  it("filters digital offers", () => {
    expect(filterOffers("digital", sample).map((o) => o.id)).toEqual(["digital-1"]);
  });
});
