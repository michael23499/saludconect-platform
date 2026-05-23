import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getUserProfileById } from "../queries/users";
import type { User as Profile } from "../db";

export type AuthUser = {
  id: string;
  email: string | undefined;
  fullNameFromProvider: string | null;
  avatarUrlFromProvider: string | null;
};

export type CurrentUser = {
  auth: AuthUser;
  profile: Profile | null;
};

/**
 * Devuelve el usuario autenticado + su perfil de public.users.
 * `profile` será null si el usuario aún no completó su registro (sin rol).
 * Cacheado por petición con React `cache`.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const u = data.user;
    const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
    const auth: AuthUser = {
      id: u.id,
      email: u.email,
      fullNameFromProvider:
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        null,
      avatarUrlFromProvider:
        (meta.avatar_url as string | undefined) ??
        (meta.picture as string | undefined) ??
        null,
    };

    // Si la BD falla (no disponible, sin DATABASE_URL, hipo del pooler), NO
    // tumbamos toda la app: tratamos al usuario como autenticado sin perfil
    // cargado en vez de lanzar un 500 global desde el RootLayout.
    let profile: Profile | null = null;
    try {
      profile = await getUserProfileById(u.id);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[getCurrentUser] error cargando perfil:", (e as Error).message);
      }
    }
    return { auth, profile };
  } catch (e) {
    // Fallo de auth (Supabase no disponible, env vars ausentes, etc.):
    // devolver null = "no logueado" en vez de romper el render del layout.
    if (process.env.NODE_ENV === "development") {
      console.error("[getCurrentUser] error de auth:", (e as Error).message);
    }
    return null;
  }
});
