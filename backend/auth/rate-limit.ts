import "server-only";
import { headers } from "next/headers";

/**
 * Rate limiter en memoria (sliding window) por IP + bucket.
 *
 * ⚠️ LIMITACIÓN: en serverless (Vercel) cada instancia tiene su propia memoria,
 * así que esto NO es un límite global perfecto — un atacante repartido entre
 * instancias puede superarlo. Mitiga el abuso casual y la enumeración básica.
 * Para un límite robusto en producción multi-instancia, migrar a Upstash
 * Redis (@upstash/ratelimit) o Vercel KV.
 */
const hits = new Map<string, number[]>();

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Devuelve true si la petición está permitida, false si excede el límite.
 */
export async function rateLimit(
  bucket: string,
  max = 15,
  windowMs = 60_000,
): Promise<boolean> {
  const ip = await clientIp();
  const key = `${bucket}:${ip}`;
  const now = Date.now();

  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  // Limpieza ocasional para que el Map no crezca sin límite.
  if (hits.size > 5000) {
    for (const [k, arr] of hits) {
      const live = arr.filter((t) => now - t < windowMs);
      if (live.length === 0) hits.delete(k);
      else hits.set(k, live);
    }
  }

  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
