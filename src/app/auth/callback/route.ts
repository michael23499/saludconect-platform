import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserProfileById } from "@backend/queries/users";
import { dashboardPathForRole } from "@backend/auth/paths";

/**
 * Solo aceptamos `next` si es un path interno absoluto (empieza por `/`)
 * y no comienza con `//` o `\\` (que en algunos parsers se interpreta
 * como URL externa). Esto evita open-redirect a través del callback.
 */
function safeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?error=no_user_after_callback`);
  }

  // Si el flujo nos dio un `next` válido (p.ej. /set-password tras
  // el magic link), respétalo — el usuario llegó aquí con intención.
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Sin `next`: comportamiento por defecto según el estado del perfil.
  const profile = await getUserProfileById(userData.user.id);
  if (!profile) {
    return NextResponse.redirect(`${origin}/complete-profile`);
  }
  return NextResponse.redirect(`${origin}${dashboardPathForRole(profile.role)}`);
}
