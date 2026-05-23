import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy-helper";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

/**
 * El proxy SOLO debe correr en rutas donde la sesión importa de verdad.
 *
 * Excluimos:
 * - `_next/*`, favicon, assets estáticos (no hay sesión que refrescar)
 * - `auth/callback` (lo gestiona su propio route handler; no queremos
 *   tocar cookies antes de exchangeCodeForSession)
 * - Páginas públicas estáticas: landing, clinics, professionals, search,
 *   contact, how-it-works, legal/*. Aunque el Header muestra UserMenu,
 *   eso se resuelve en RootLayout — no necesitamos refrescar la sesión
 *   en cada request anónimo a estas páginas.
 *
 * Incluimos: /login, /register, /dashboard/*, /complete-profile,
 * /set-password, /admin y APIs auth.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|auth/callback|clinics|professionals|search|contact|how-it-works|legal|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
