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

  const profile = await getUserProfileById(u.id);
  return { auth, profile };
});
