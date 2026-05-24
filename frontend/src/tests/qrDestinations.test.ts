import { describe, expect, it } from "vitest";
import { buildQrTrackingPath, resolveQrTarget } from "@/shared/config/qrDestinations";

describe("buildQrTrackingPath", () => {
  it("uses agent when set", () => {
    const r = buildQrTrackingPath({ totemId: "T1", agent: "smoker" });
    expect(r.path).toBe("/qr/T1?agent=smoker");
    expect(r.destinationUrl).toBe("https://tribu.stop-tabac.ch/");
  });

  it("uses offer destination when no agent", () => {
    const r = buildQrTrackingPath({ totemId: "T1", offerFilter: "cipret" });
    expect(r.path).toBe("/qr/T1?destination=cipret");
    expect(r.destinationUrl).toBe("https://www.vivre-sans-fumer.ch/");
  });

  it("falls back to Smokwit map", () => {
    const r = buildQrTrackingPath({ totemId: "T1" });
    expect(r.path).toBe("/qr/T1");
    expect(r.destinationUrl).toBe("https://smokwit.ch/map");
  });
});

describe("resolveQrTarget", () => {
  it("builds full tracking URL", () => {
    const r = resolveQrTarget({
      apiBase: "http://127.0.0.1:8000",
      totemId: "TOTEM_001",
      agent: "expert",
    });
    expect(r.trackingUrl).toBe("http://127.0.0.1:8000/qr/TOTEM_001?agent=expert");
    expect(r.destinationUrl).toBe("https://smokwit.ch/coaching");
  });
});
