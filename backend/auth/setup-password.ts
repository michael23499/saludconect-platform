"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkEmailStatus } from "./check-email";
import { requireSession } from "./guards";
import { dashboardPathForRole } from "./paths";
import { getRequestOrigin } from "./origin";

export type SetupPasswordRequestState =
  | null
  | { kind: "error"; message: string }
  | { kind: "sent"; email: string };

/**
 * Manda un magic link al email para que el usuario, una vez verificado,
 * pueda establecer contraseña en /set-password.
 *
 * Valida que el email exista ANTES de llamar a Supabase, porque
 * `signInWithOtp({ shouldCreateUser: false })` devuelve OK silencioso si
 * el email no está registrado (decisión de privacy de Supabase). Sin esta
 * validación, el usuario vería "revisa tu correo" pero nunca llegaría nada.
 */
export async function requestPasswordSetupLink(
  _prev: SetupPasswordRequestState,
  formData: FormData,
): Promise<SetupPasswordRequestState> {
  const emailRaw = formData.get("email");
  if (typeof emailRaw !== "string" || !emailRaw.includes("@")) {
    return { kind: "error", message: "Email no válido." };
  }
  const email = emailRaw.trim().toLowerCase();

  const status = await checkEmailStatus(email);
  if (!status.exists) {
    return {
      kind: "error",
      message: "No hay ninguna cuenta con ese email.",
    };
  }

  const origin = await getRequestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback?next=/set-password`,
    },
  });

  if (error) {
    return { kind: "error", message: prettifyEmailError(error.message) };
  }
  return { kind: "sent", email };
}

/**
 * Convierte mensajes técnicos de Supabase Auth en algo que el usuario entiende.
 * Los errores más comunes vienen del SMTP gratuito (rate limit) o de validación.
 */
function prettifyEmailError(raw: string | undefined): string {
  const msg = (raw ?? "").toLowerCase();
  if (msg.includes("rate limit") || msg.includes("over_email_send_rate")) {
    return "Hemos enviado varios emails a esta dirección recientemente. Espera unos minutos antes de volver a intentarlo.";
  }
  if (msg.includes("invalid") && msg.includes("email")) {
    return "El email no es válido.";
  }
  if (msg.includes("smtp") || msg.includes("send")) {
    return "No pudimos enviar el email en este momento. Inténtalo de nuevo en unos minutos.";
  }
  return raw || "No se pudo enviar el email.";
}

export type SetPasswordState =
  | null
  | { kind: "error"; message: string };

/**
 * Establece la contraseña del usuario autenticado actual.
 * Solo válido si el user ya tiene sesión (vino de un magic link).
 */
export async function setPasswordAction(
  _prev: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const password = formData.get("password");
  const confirm = formData.get("confirmPassword");

  if (typeof password !== "string" || password.length < 8) {
    return { kind: "error", message: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { kind: "error", message: "Las contraseñas no coinciden." };
  }

  const current = await requireSession();
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    // No exponemos el mensaje técnico de Supabase al usuario.
    return { kind: "error", message: "No se pudo guardar la contraseña. Inténtalo de nuevo." };
  }

  redirect(current.profile ? dashboardPathForRole(current.profile.role) : "/complete-profile");
}
