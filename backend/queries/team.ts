import { and, asc, eq } from "drizzle-orm";
import { db, clinicTeam, users, professionals, specialties } from "../db";

export type TeamProfessional = {
  professionalId: string;
  fullName: string;
  avatarUrl: string | null;
  verified: boolean;
  specialtyName: string | null;
  city: string | null;
  proType: "doctor" | "technician" | null;
  headline: string | null;
  bio: string | null;
  yearsExperience: number | null;
  hourlyRate: number | null;
};

/** Profesionales de confianza guardados por una clínica, con su ficha. */
export async function listClinicTeam(clinicId: string): Promise<TeamProfessional[]> {
  return db
    .select({
      professionalId: clinicTeam.professionalId,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
      verified: users.verified,
      specialtyName: specialties.name,
      city: users.city,
      proType: professionals.proType,
      headline: professionals.headline,
      bio: professionals.bio,
      yearsExperience: professionals.yearsExperience,
      hourlyRate: professionals.hourlyRate,
    })
    .from(clinicTeam)
    .innerJoin(users, eq(users.id, clinicTeam.professionalId))
    .leftJoin(professionals, eq(professionals.id, clinicTeam.professionalId))
    .leftJoin(specialties, eq(specialties.id, professionals.specialtyId))
    .where(eq(clinicTeam.clinicId, clinicId))
    .orderBy(asc(users.fullName));
}

/** Añade un profesional al equipo de la clínica (idempotente). */
export async function addToClinicTeam(clinicId: string, professionalId: string): Promise<void> {
  await db
    .insert(clinicTeam)
    .values({ clinicId, professionalId })
    .onConflictDoNothing({ target: [clinicTeam.clinicId, clinicTeam.professionalId] });
}

/** Quita un profesional del equipo de la clínica. */
export async function removeFromClinicTeam(clinicId: string, professionalId: string): Promise<void> {
  await db
    .delete(clinicTeam)
    .where(and(eq(clinicTeam.clinicId, clinicId), eq(clinicTeam.professionalId, professionalId)));
}

/** ¿Está ese profesional en el equipo de la clínica? (para el botón añadir/quitar). */
export async function isInClinicTeam(clinicId: string, professionalId: string): Promise<boolean> {
  const rows = await db
    .select({ id: clinicTeam.id })
    .from(clinicTeam)
    .where(and(eq(clinicTeam.clinicId, clinicId), eq(clinicTeam.professionalId, professionalId)))
    .limit(1);
  return rows.length > 0;
}
