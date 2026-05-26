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
 * Manda el email de recuperación de contraseña.
 *
 * Comprobamos si el email está registrado: si NO existe, devolvemos un error
 * claro pidiendo al usuario que verifique el correo (decisión de producto: el
 * cliente prefiere avisar antes que dejar a alguien esperando un email que no
 * va a llegar). Si existe, enviamos el enlace de recuperación. El rate limit
 * por IP frena la enumeración masiva y el email-bombing.
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

  // Si el correo no está registrado, avisamos en lugar de simular el envío.
  const status = await checkEmailStatus(email);
  if (!status.exists) {
    return {
      kind: "error",
      message:
        "No hay ninguna cuenta registrada con ese correo. Verifica que lo hayas escrito bien o crea una cuenta nueva.",
    };
  }

  const origin = await getRequestOrigin();
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm`,
  });

  return { kind: "sent", email };
}
