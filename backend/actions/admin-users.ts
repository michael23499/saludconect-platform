"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../auth/guards";
import { getRequestOrigin } from "../auth/origin";
import { createAdminClient } from "../auth/admin-client";
import { checkEmailStatus } from "../auth/check-email";
import {
  listUsers,
  USERS_PAGE_SIZE,
  getUserProfileById,
  updateUserRole,
  setUserVerified,
  setUserSuspended,
  updateUserProfile,
  updateUserAvatar,
  createUserProfile,
} from "../queries/users";
import { buildUserFilters } from "@/lib/user-filters";
import type { User } from "../db";

const USERS_PATH = "/admin/users";

export type UsersFiltersRaw = { role?: string; from?: string; to?: string; q?: string };

/**
 * Devuelve la siguiente página de usuarios (lazy load / scroll infinito de la
 * tabla admin). El cliente pasa los filtros crudos de la URL y el offset actual.
 */
export async function loadUsersPage(
  raw: UsersFiltersRaw,
  offset: number,
): Promise<User[]> {
  await requireRole("admin");
  return listUsers(buildUserFilters(raw), USERS_PAGE_SIZE, offset);
}

/**
 * Cambia el rol de un usuario. Salvaguarda: un admin no puede cambiar su
 * propio rol (evita auto-degradarse y perder acceso al panel sin querer).
 */
export async function changeUserRoleAction(userId: string, role: User["role"]) {
  const admin = await requireRole("admin");
  if (userId === admin.profile.id) {
    throw new Error("No puedes cambiar tu propio rol.");
  }
  await updateUserRole(userId, role);
  revalidatePath(USERS_PATH);
}

/** Marca/desmarca un usuario como verificado. */
export async function setUserVerifiedAction(userId: string, verified: boolean) {
  await requireRole("admin");
  await setUserVerified(userId, verified);
  revalidatePath(USERS_PATH);
  // Verificar afecta también la cola de aprobaciones y los KPIs del home admin.
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
}

/**
 * Suspende/reactiva un usuario (soft-delete reversible). Salvaguarda: un admin
 * no puede suspenderse a sí mismo.
 */
export async function setUserSuspendedAction(userId: string, suspended: boolean) {
  const admin = await requireRole("admin");
  if (userId === admin.profile.id) {
    throw new Error("No puedes suspender tu propia cuenta.");
  }
  await setUserSuspended(userId, suspended);
  revalidatePath(USERS_PATH);
  // Suspender saca al usuario de la cola de aprobaciones y mueve los KPIs.
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
}

/** Edita los datos básicos de perfil de un usuario (nombre, teléfono, ciudad). */
export async function updateUserProfileAction(
  userId: string,
  data: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    postalCode: string;
    lat: number | null;
    lng: number | null;
  },
) {
  await requireRole("admin");
  const fullName = data.fullName.trim();
  if (fullName.length < 2) {
    throw new Error("El nombre debe tener al menos 2 caracteres.");
  }
  await updateUserProfile(userId, {
    fullName,
    phone: data.phone.trim() || null,
    city: data.city.trim() || null,
    address: data.address.trim() || null,
    postalCode: data.postalCode.trim() || null,
    lat: data.lat,
    lng: data.lng,
  });
  revalidatePath(USERS_PATH);
}

export type InviteUserState =
  | null
  | { kind: "error"; message: string }
  | { kind: "sent"; email: string };

const INVITABLE_ROLES: User["role"][] = ["professional", "clinic", "admin"];

/**
 * Invita a una persona (que aún NO tiene cuenta) con el rol elegido.
 * Manda un email de invitación de Supabase y pre-crea su perfil con ese rol.
 * Los admins se crean verificados; profesionales y clínicas siguen el flujo
 * normal de verificación. Al aceptar, establece contraseña en /set-password.
 * Si el email ya existe, sugerimos cambiarle el rol desde el menú de la fila.
 */
export async function inviteUserAction(
  _prev: InviteUserState,
  formData: FormData,
): Promise<InviteUserState> {
  await requireRole("admin");

  const emailRaw = formData.get("email");
  const nameRaw = formData.get("fullName");
  const roleRaw = formData.get("role");

  const role = INVITABLE_ROLES.find((r) => r === roleRaw);
  if (!role) {
    return { kind: "error", message: "Selecciona un rol válido." };
  }
  if (typeof emailRaw !== "string" || !emailRaw.includes("@")) {
    return { kind: "error", message: "Email no válido." };
  }
  const email = emailRaw.trim().toLowerCase();
  const fullName = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (fullName.length < 2) {
    return { kind: "error", message: "Indica el nombre de la persona." };
  }

  const supabase = createAdminClient();
  const origin = await getRequestOrigin();

  // Verificación proactiva contra la BD (auth.users) antes de invitar:
  //  - con perfil activo en public.users → avisamos (cámbiale el rol).
  //  - registrado pero SIN perfil (lo borraron / nunca completó) → limpiamos el
  //    huérfano para poder reenviar la invitación.
  //  - libre → seguimos y enviamos.
  const status = await checkEmailStatus(email);
  if (status.exists) {
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email);
    const profile = existing ? await getUserProfileById(existing.id) : null;
    if (profile) {
      return {
        kind: "error",
        message: "Ya hay una cuenta con ese email. Cámbiale el rol desde el menú de su fila.",
      };
    }
    if (existing) {
      await supabase.auth.admin.deleteUser(existing.id);
    }
  }

  // Email libre → enviamos la invitación y pre-creamos el perfil con el rol
  // elegido (admin entra verificado; el resto sigue el flujo de verificación).
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/set-password`,
    data: { full_name: fullName },
  });
  if (error || !data?.user) {
    return { kind: "error", message: "No se pudo enviar la invitación. Inténtalo de nuevo en unos minutos." };
  }

  await createUserProfile({
    id: data.user.id,
    email,
    fullName,
    role,
    verified: role === "admin",
  });

  revalidatePath(USERS_PATH);
  return { kind: "sent", email };
}

/**
 * Sube una nueva foto de avatar al bucket público 'avatars' de Supabase Storage
 * y actualiza el perfil. Devuelve la URL pública o un mensaje de error.
 */
export async function uploadUserAvatarAction(
  userId: string,
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  await requireRole("admin");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen válida." };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: "La imagen no puede superar 2 MB." };
  }

  try {
    const supabase = createAdminClient();

    // Asegura el bucket público. Si createBucket falla por algo distinto a
    // "ya existe", lo propagamos para verlo (no lo tragamos en silencio).
    const { error: bucketErr } = await supabase.storage.createBucket("avatars", {
      public: true,
      fileSizeLimit: "2MB",
    });
    if (bucketErr && !/exist/i.test(bucketErr.message)) {
      console.error("[avatar] createBucket:", bucketErr);
      return { error: `No se pudo preparar Storage: ${bucketErr.message}` };
    }

    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type || "image/png" });
    if (upErr) {
      console.error("[avatar] upload:", upErr);
      return { error: `No se pudo subir la imagen: ${upErr.message}` };
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await updateUserAvatar(userId, data.publicUrl);
    // El avatar aparece en muchas rutas (tabla, dashboards, menús): revalidamos
    // todo el árbol del layout raíz para que se refleje en todas partes.
    revalidatePath("/", "layout");
    return { url: data.publicUrl };
  } catch (e) {
    console.error("[avatar] unexpected:", e);
    return { error: e instanceof Error ? e.message : "No se pudo subir la imagen." };
  }
}
