import { and, asc, eq, sql } from "drizzle-orm";
import { db, clinics, users, surgeries, type Clinic, type NewClinic } from "../db";

export async function getClinicById(id: string): Promise<Clinic | null> {
  const rows = await db.select().from(clinics).where(eq(clinics.id, id)).limit(1);
  return rows[0] ?? null;
}

export type PublicClinic = {
  id: string;
  /** Nombre del usuario (fallback si no hay nombre comercial). */
  name: string;
  /** Nombre comercial del centro (puede diferir del fullName). */
  clinicName: string | null;
  city: string | null;
  avatarUrl: string | null;
  verified: boolean;
  specialties: string[] | null;
  /** Descripción pública del centro (no sensible). */
  about: string | null;
  /** Sitio web público (no sensible). */
  website: string | null;
  /** Nº de cirugías abiertas que el centro tiene publicadas ahora. */
  openSurgeries: number;
};

/**
 * Clínicas para el directorio público: centros verificados, no suspendidos y
 * con perfil público. Espejo de listPublicProfessionals pero para el rol clinic.
 * Incluye solo datos NO sensibles (descripción, web y nº de cirugías activas);
 * nunca teléfono ni dirección.
 */
export async function listPublicClinics(): Promise<PublicClinic[]> {
  return db
    .select({
      id: clinics.id,
      name: users.fullName,
      clinicName: clinics.clinicName,
      city: users.city,
      avatarUrl: users.avatarUrl,
      verified: users.verified,
      specialties: clinics.specialties,
      about: clinics.about,
      website: clinics.website,
      openSurgeries: sql<number>`(
        select count(*)::int from ${surgeries}
        where ${surgeries.clinicId} = ${clinics.id}
          and ${surgeries.status} = 'open'
          and ${surgeries.deletedAt} is null
      )`,
    })
    .from(clinics)
    .innerJoin(users, eq(users.id, clinics.id))
    .where(
      and(eq(users.verified, true), eq(users.suspended, false), eq(users.isPublic, true)),
    )
    .orderBy(asc(users.fullName));
}

/** Crea la fila de clínica de forma idempotente (onboarding reintentable). */
export async function createClinic(data: NewClinic): Promise<void> {
  await db.insert(clinics).values(data).onConflictDoNothing();
}

export async function updateClinic(
  id: string,
  data: Partial<Omit<NewClinic, "id">>,
): Promise<void> {
  await db
    .update(clinics)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(clinics.id, id));
}
