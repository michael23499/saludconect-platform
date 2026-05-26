"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../auth/guards";
import { addToClinicTeam, removeFromClinicTeam } from "../queries/team";

const TEAM_PATH = "/dashboard/clinic/team";

export type TeamResult = { ok: true } | { error: string };

/** La clínica guarda a un profesional en su equipo de confianza. */
export async function addToTeamAction(professionalId: string): Promise<TeamResult> {
  const clinic = await requireRole("clinic");
  if (clinic.profile.role === "admin") {
    return { error: "Los administradores no gestionan equipos de clínica." };
  }
  if (!professionalId) return { error: "Profesional no válido." };
  await addToClinicTeam(clinic.profile.id, professionalId);
  revalidatePath(TEAM_PATH);
  revalidatePath(`/professionals/${professionalId}`);
  return { ok: true };
}

/** La clínica quita a un profesional de su equipo. */
export async function removeFromTeamAction(professionalId: string): Promise<TeamResult> {
  const clinic = await requireRole("clinic");
  if (clinic.profile.role === "admin") {
    return { error: "Los administradores no gestionan equipos de clínica." };
  }
  await removeFromClinicTeam(clinic.profile.id, professionalId);
  revalidatePath(TEAM_PATH);
  revalidatePath(`/professionals/${professionalId}`);
  return { ok: true };
}
