"use server";

import { checkEmailStatus } from "./check-email";
import { rateLimit } from "./rate-limit";

export type EmailPrecheck =
  | { kind: "not-found" }
  | { kind: "has-password" }
  | { kind: "oauth-only"; providers: string[] }
  | { kind: "invalid" };

/**
 * Comprueba el estado de un email para guiar el UX del login.
 * Llamada idempotente y barata (1 query). Pensada para invocarse onBlur.
 * Rate-limited para frenar la enumeración de emails registrados.
 */
export async function precheckEmailAction(email: string): Promise<EmailPrecheck> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@") || !normalized.includes(".")) {
    return { kind: "invalid" };
  }

  // Si excede el límite, respondemos "invalid" (no revela nada del email).
  const allowed = await rateLimit("precheck", 20, 60_000);
  if (!allowed) {
    return { kind: "invalid" };
  }

  const status = await checkEmailStatus(normalized);
  if (!status.exists) return { kind: "not-found" };
  if (status.hasPassword) return { kind: "has-password" };
  if (status.providers.length > 0) return { kind: "oauth-only", providers: status.providers };
  return { kind: "not-found" };
}
