"use server";

import { createClient } from "@/lib/supabase/server";
import { checkEmailStatus } from "./check-email";
import { getRequestOrigin } from "./origin";
import { rateLimit } from "./rate-limit";

export type ResetPasswordState =
  | null
  | { kind: "error"; message: string }
  | { kind: "sent"; email: string };

/**
 * Manda el email de recuperación de contraseña (privacidad primero).
 *
 * Comprobamos POR DEBAJO si el email existe y solo enviamos si existe (evitando
 * la petición de envío inútil). Pero al usuario le devolvemos SIEMPRE el mismo
 * estado neutro — la UI muestra "si ese email tiene cuenta, te enviamos el
 * enlace" — así no filtramos qué emails están registrados. Rate limit por IP.
 */
export async function requestPasswordReset(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const emailRaw = formData.get("email");
  if (typeof emailRaw !== "string" || !emailRaw.includes("@")) {
    return { kind: "error", message: "Introduce un email válido." };
  }
  const email = emailRaw.trim().toLowerCase();

  // Frena enumeración masiva y email-bombing por IP.
  const allowed = await rateLimit("reset", 5, 60_000);
  if (!allowed) {
    return { kind: "error", message: "Demasiados intentos. Espera un momento e inténtalo de nuevo." };
  }

  // Comprobación interna silenciosa: solo enviamos de verdad si el email existe
  // (así evitamos la petición de envío inútil). El estado devuelto es el mismo
  // exista o no — el mensaje neutro lo pone la UI.
  const status = await checkEmailStatus(email);
  if (status.exists) {
    const origin = await getRequestOrigin();
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/set-password`,
    });
  }

  return { kind: "sent", email };
}
