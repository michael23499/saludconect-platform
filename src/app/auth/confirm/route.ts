import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileFromMetadata } from "@backend/auth/ensure-profile";

/**
 * Solo aceptamos `next` si es un path interno absoluto. Evita open-redirect.
 */
function safeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

/**
 * Verifica enlaces de email basados en token_hash (invitación, recovery,
 * cambio de email…). A diferencia de /auth/callback (que canjea un `code` de
 * OAuth/PKCE), aquí usamos verifyOtp: esto ESTABLECE la sesión del usuario del
 * token aunque el navegador ya tuviera otra sesión activa — justo lo que
 * necesita "aceptar invitación" (no quedarse en la cuenta logueada).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=invalid_or_expired`);
  }

  // Alta confirmada: AHORA materializamos el perfil en public.users desde el
  // user_metadata que guardó signUpAction (antes no existía). Idempotente; si
  // falla, el usuario queda con sesión y los guards lo llevan a /complete-profile.
  if (type === "signup" || type === "email") {
    try {
      await ensureProfileFromMetadata(data.user);
    } catch {
      // No bloqueamos la confirmación por un fallo al crear el perfil.
    }
  }

  // Destino tras verificar. El alta (signup) → pantalla de bienvenida "cuenta
  // confirmada"; recovery/invitación → establecer contraseña. `next` explícito
  // (si es interno) tiene prioridad.
  const fallback = type === "signup" || type === "email" ? "/auth/confirmed" : "/set-password";
  const next = safeNext(searchParams.get("next")) ?? fallback;
  return NextResponse.redirect(`${origin}${next}`);
}
