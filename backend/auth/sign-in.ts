"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfileById } from "../queries/users";
import { checkEmailStatus } from "./check-email";
import { dashboardPathForRole } from "./paths";
import { rateLimit } from "./rate-limit";

export type SignInState =
  | null
  | { kind: "error"; message: string }
  | { kind: "oauth-only"; email: string; providers: string[] }
  | { kind: "magic-link-sent"; email: string };

/**
 * Login con email + contraseña.
 * Si el email pertenece a una cuenta OAuth (sin password), devuelve un
 * estado especial `oauth-only` para que la UI ofrezca alternativas.
 */
export async function signInWithPasswordAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const emailRaw = formData.get("email");
  const password = formData.get("password");

  if (typeof emailRaw !== "string" || !emailRaw.includes("@")) {
    return { kind: "error", message: "Introduce un email válido." };
  }
  if (typeof password !== "string" || password.length < 1) {
    return { kind: "error", message: "Introduce tu contraseña." };
  }
  const email = emailRaw.trim().toLowerCase();

  // Frena fuerza bruta de contraseñas por IP.
  const allowed = await rateLimit("signin", 10, 60_000);
  if (!allowed) {
    return { kind: "error", message: "Demasiados intentos. Espera un momento e inténtalo de nuevo." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    const status = await checkEmailStatus(email);

    // Única excepción útil: si la cuenta es OAuth-only (sin contraseña), guiamos
    // a entrar con Google. Para TODO lo demás —el email no existe O la contraseña
    // es incorrecta— devolvemos el MISMO mensaje genérico, sin distinguir, para
    // no filtrar qué emails están registrados (enumeración).
    if (status.exists && !status.hasPassword && status.providers.length > 0) {
      return { kind: "oauth-only", email, providers: status.providers };
    }
    return { kind: "error", message: "Email o contraseña incorrectos." };
  }

  const profile = await getUserProfileById(data.user.id);
  if (!profile) {
    redirect("/complete-profile");
  }
  redirect(dashboardPathForRole(profile.role));
}
