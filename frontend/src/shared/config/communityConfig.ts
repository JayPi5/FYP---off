function intEnv(name: string, fallback: number): number {
  const raw = import.meta.env[name] as string | undefined;
  const value = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(value)) return fallback;
  return value;
}

export const COMMUNITY_CONFIG = {
  ledGreenMinPercent: intEnv("VITE_LED_GREEN_MIN_PERCENT", 71),
  ledOrangeMinPercent: intEnv("VITE_LED_ORANGE_MIN_PERCENT", 31),
};

