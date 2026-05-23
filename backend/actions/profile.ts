"use server";

import { redirect } from "next/navigation";
import { requireSession } from "../auth/guards";
import { dashboardPathForRole } from "../auth/paths";
import { createUserProfile, getUserProfileById } from "../queries/users";

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

  await createUserProfile({
    id: current.auth.id,
    email: current.auth.email ?? "",
    fullName: fullName.trim(),
    role,
    phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
    city: typeof city === "string" && city.trim() ? city.trim() : null,
    avatarUrl: current.auth.avatarUrlFromProvider,
    verified: false,
  });

  redirect(dashboardPathForRole(role));
}
