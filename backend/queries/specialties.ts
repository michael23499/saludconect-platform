import { eq, asc } from "drizzle-orm";
import { db, specialties, type Specialty } from "../db";

/** Especialidades activas, para selectores y listados. */
export async function listActiveSpecialties(): Promise<Specialty[]> {
  return db
    .select()
    .from(specialties)
    .where(eq(specialties.active, true))
    .orderBy(asc(specialties.name));
}

export async function getSpecialtyById(id: string): Promise<Specialty | null> {
  const rows = await db.select().from(specialties).where(eq(specialties.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getSpecialtyBySlug(slug: string): Promise<Specialty | null> {
  const rows = await db.select().from(specialties).where(eq(specialties.slug, slug)).limit(1);
  return rows[0] ?? null;
}
