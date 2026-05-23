import "server-only";
import { headers } from "next/headers";

/**
 * Origin base para construir URLs absolutas (magic links, redirects).
 * Prioridad:
 *   1. NEXT_PUBLIC_SITE_URL — la más fiable en producción (sin depender de proxies)
 *   2. Headers del request (x-forwarded-host/proto) — respeta reverse proxies
 *   3. http://localhost:3000 — último recurso en desarrollo
 */
export async function getRequestOrigin(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}
