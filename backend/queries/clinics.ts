import { eq } from "drizzle-orm";
import { db, clinics, type Clinic, type NewClinic } from "../db";

export async function getClinicById(id: string): Promise<Clinic | null> {
  const rows = await db.select().from(clinics).where(eq(clinics.id, id)).limit(1);
  return rows[0] ?? null;
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
