import QRCode from "qrcode";

const API_BASE_URL = (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://127.0.0.1:8000";
const TOTEM_ID = (import.meta.env.VITE_TOTEM_ID as string | undefined) ?? "TOTEM_001";

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

/**
 * For now: same QR for tests (like your QR.vue)
 * Later we can add ?mode=discussion etc
 */
export function buildTotemQrTargetUrl(): string {
  return joinUrl(API_BASE_URL, `/qr/${encodeURIComponent(TOTEM_ID)}`);
}

export async function generateQrDataUrl(targetUrl: string): Promise<string> {
  return await QRCode.toDataURL(targetUrl, { margin: 2, scale: 10 });
}
