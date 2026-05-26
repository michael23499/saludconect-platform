import "server-only";
import { headers } from "next/headers";

/**
 * Origin base para construir URLs absolutas (enlaces de email, redirects).
 * Prioridad:
 *   1. Host REAL del request (x-forwarded-host/proto) — así los enlaces de email
 *      apuntan al origen desde donde se generaron: localhost en dev, dominio en
 *      prod. Supabase valida el redirect contra sus Redirect URLs, así que un
 *      host falsificado no pasaría.
 *   2. NEXT_PUBLIC_SITE_URL — respaldo para contextos sin request.
 *   3. http://localhost:3000 — último recurso.
 */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");

  return "http://localhost:3000";
}
