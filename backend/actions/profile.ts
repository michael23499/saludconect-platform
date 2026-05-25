"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession, requireRole } from "../auth/guards";
import { dashboardPathForRole } from "../auth/paths";
import { createUserProfile, setUserPublic } from "../queries/users";
import { createProfessional } from "../queries/professionals";
import { createClinic } from "../queries/clinics";
import { getSpecialtyBySlug } from "../queries/specialties";
import { CAPILAR_SLUG } from "../db/seed-data";

export async function completeProfileAction(formData: FormData) {
  const current = await requireSession();

  const role = formData.get("role");
  const fullName = formData.get("fullName");
  const phone = formData.get("phone");
  const city = formData.get("city");

  if (role !== "professional" && role !== "clinic") {
    throw new Error("Rol inválido");
  }
  if (typeof fullName !== "string" || fullName.trim().length < 2) {
    throw new Error("Nombre completo requerido (mínimo 2 caracteres)");
  }

  // Si ya existe perfil, no duplicar — solo redirigir
  if (current.profile) {
    redirect(dashboardPathForRole(current.profile.role));
  }

  const cleanName = fullName.trim();
  const cleanCity = typeof city === "string" && city.trim() ? city.trim() : null;

  await createUserProfile({
    id: current.auth.id,
    email: current.auth.email ?? "",
    fullName: cleanName,
    role,
    phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
    city: cleanCity,
    avatarUrl: current.auth.avatarUrlFromProvider,
    verified: false,
  });

  // Crea la fila del perfil extendido según el rol. Idempotente (onConflictDoNothing).
  if (role === "professional") {
    // Por ahora el marketplace arranca solo con "Microinjerto capilar": asignamos
    // esa especialidad automáticamente. Cuando haya más, el formulario la pedirá.
    const capilar = await getSpecialtyBySlug(CAPILAR_SLUG);
    await createProfessional({
      id: current.auth.id,
      specialtyId: capilar?.id ?? null,
      availableForWork: true,
    });
  } else {
    await createClinic({
      id: current.auth.id,
      clinicName: cleanName,
    });
  }

  redirect(dashboardPathForRole(role));
}

/**
 * El profesional activa/desactiva su aparición en el directorio público
 * (/search). Opt-out: por defecto aparece. El admin no tiene perfil público.
 */
export async function setProfileVisibilityAction(
  isPublic: boolean,
): Promise<{ ok: true } | { error: string }> {
  const me = await requireRole("professional");
  if (me.profile.role === "admin") {
    return { error: "Los administradores no tienen perfil en el directorio público." };
  }
  await setUserPublic(me.profile.id, isPublic);
  revalidatePath("/dashboard/professional/profile");
  revalidatePath("/search");
  return { ok: true };
}
