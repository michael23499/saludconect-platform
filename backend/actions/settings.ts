"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "../auth/guards";
import { createAdminClient } from "../auth/admin-client";
import { updateUserProfile, updateUserAvatar } from "../queries/users";
import { updateProfessional } from "../queries/professionals";
import { updateClinic } from "../queries/clinics";

export type UpdateProfileResult = { ok: true } | { error: string };

export type MyProfileInput = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  // Solo profesional
  headline?: string;
  bio?: string;
  yearsExperience?: number | null;
  hourlyRate?: number | null;
  // Solo clínica
  clinicName?: string;
  specialties?: string[];
  about?: string;
  website?: string;
};

/**
 * El propio usuario edita su perfil desde Ajustes. Reutiliza las queries de
 * users + el perfil extendido según el rol (professional → professionals,
 * clinic → clinics). El email no se edita (va ligado a auth).
 */
export async function updateMyProfileAction(data: MyProfileInput): Promise<UpdateProfileResult> {
  const me = await requireRole(["professional", "clinic"]);
  const fullName = data.fullName.trim();
  if (fullName.length < 2) return { error: "El nombre debe tener al menos 2 caracteres." };

  await updateUserProfile(me.profile.id, {
    fullName,
    phone: data.phone.trim() || null,
    city: data.city.trim() || null,
    address: data.address.trim() || null,
    postalCode: data.postalCode.trim() || null,
    lat: data.lat,
    lng: data.lng,
  });

  if (me.profile.role === "professional") {
    await updateProfessional(me.profile.id, {
      headline: data.headline?.trim() || null,
      bio: data.bio?.trim() || null,
      yearsExperience: data.yearsExperience ?? null,
      hourlyRate: data.hourlyRate ?? null,
    });
  } else if (me.profile.role === "clinic") {
    const specialties = (data.specialties ?? []).map((s) => s.trim()).filter(Boolean);
    await updateClinic(me.profile.id, {
      clinicName: data.clinicName?.trim() || null,
      specialties: specialties.length ? specialties : null,
      about: data.about?.trim() || null,
      website: data.website?.trim() || null,
    });
  }

  revalidatePath("/dashboard/clinic/settings");
  revalidatePath("/dashboard/professional/settings");
  revalidatePath("/dashboard/professional/profile");
  // Nombre/avatar aparecen en el header y muchas vistas → revalidar layout raíz.
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Sube la foto de avatar del propio usuario al bucket 'avatars' y actualiza su
 * perfil. Misma lógica que la acción de admin pero sobre la cuenta en sesión.
 */
export async function uploadMyAvatarAction(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const me = await requireRole(["professional", "clinic"]);

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { error: "Selecciona una imagen válida." };
  if (file.size > 2 * 1024 * 1024) return { error: "La imagen no puede superar 2 MB." };

  try {
    const supabase = createAdminClient();
    const { error: bucketErr } = await supabase.storage.createBucket("avatars", {
      public: true,
      fileSizeLimit: "2MB",
    });
    if (bucketErr && !/exist/i.test(bucketErr.message)) {
      return { error: `No se pudo preparar Storage: ${bucketErr.message}` };
    }

    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${me.profile.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type || "image/png" });
    if (upErr) return { error: `No se pudo subir la imagen: ${upErr.message}` };

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await updateUserAvatar(me.profile.id, data.publicUrl);
    revalidatePath("/", "layout");
    return { url: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir la imagen." };
  }
}

/**
 * Cambia la contraseña del usuario en sesión. No pide la actual: la sesión ya
 * autentica (mismo patrón que /set-password). Usa el cliente SSR con cookies.
 */
export async function changeMyPasswordAction(
  newPassword: string,
): Promise<{ ok: true } | { error: string }> {
  await requireRole(["professional", "clinic"]);
  if (newPassword.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "No se pudo cambiar la contraseña. Inténtalo de nuevo." };
  return { ok: true };
}
