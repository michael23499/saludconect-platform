"use server";

import { createClient } from "@/lib/supabase/server";
import { checkEmailStatus } from "./check-email";
import { getRequestOrigin } from "./origin";

export type ResetPasswordState =
  | null
  | { kind: "error"; message: string }
  | { kind: "sent"; email: string };

/**
 * Manda el email de recuperación de contraseña.
 *
 * Por privacy SIEMPRE devolvemos "sent" aunque el email no exista — así un
 * atacante no puede enumerar qué emails están registrados desde esta pantalla.
 * (Es el comportamiento estándar de "olvidé mi contraseña".)
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

  // Solo mandamos de verdad si el email existe; si no, no hacemos nada
  // (pero devolvemos "sent" igualmente para no filtrar existencia).
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
