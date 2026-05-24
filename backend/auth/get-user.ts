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
  const supabase = await createClient();
  // getClaims() verifica el JWT LOCALMENTE (sin red) si el proyecto usa claves
  // de firma asimétricas (ECC/RSA). Con el secreto legacy HS256 hace una llamada
  // de red equivalente a getUser(), así que este código es seguro en ambos casos.
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;

  const claims = data.claims;
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const auth: AuthUser = {
    id: claims.sub,
    email: claims.email,
    fullNameFromProvider:
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      null,
    avatarUrlFromProvider:
      (meta.avatar_url as string | undefined) ??
      (meta.picture as string | undefined) ??
      null,
  };

  const profile = await getUserProfileById(claims.sub);
  return { auth, profile };
});
