import { and, asc, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import {
  db,
  surgeries,
  users,
  applications,
  type Surgery,
  type NewSurgery,
  type Application,
} from "../db";

/** Fecha de hoy en formato YYYY-MM-DD para comparar con la columna `date`. */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function createSurgery(data: NewSurgery): Promise<Surgery> {
  const rows = await db.insert(surgeries).values(data).returning();
  return rows[0];
}

export async function getSurgeryById(id: string): Promise<Surgery | null> {
  const rows = await db.select().from(surgeries).where(eq(surgeries.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateSurgeryStatus(
  id: string,
  status: Surgery["status"],
): Promise<void> {
  await db
    .update(surgeries)
    .set({ status, updatedAt: new Date() })
    .where(eq(surgeries.id, id));
}

/** Edita los campos de una cirugía (clínica dueña o admin). La autorización la
 *  comprueba la server action; aquí solo escribimos. */
export async function updateSurgery(
  id: string,
  data: Partial<
    Pick<
      NewSurgery,
      | "title"
      | "description"
      | "date"
      | "startTime"
      | "endTime"
      | "city"
      | "address"
      | "vacancies"
      | "ratePerHour"
      | "urgent"
      | "status"
    >
  >,
): Promise<void> {
  await db
    .update(surgeries)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(surgeries.id, id));
}

export type SurgeryForProfessional = {
  surgery: Surgery;
  clinicName: string;
  clinicCity: string | null;
  clinicAvatarUrl: string | null;
  /** Estado de la postulación del técnico a esta cirugía, o null si no se ha postulado. */
  myStatus: Application["status"] | null;
  /** Id de la postulación del técnico (para poder retirarla), o null. */
  myApplicationId: string | null;
};

/**
 * Cirugías abiertas y futuras de la especialidad del técnico, con datos de la
 * clínica y si el técnico ya se postuló (para mostrar el estado del botón).
 */
export async function listOpenSurgeriesForProfessional(
  specialtyId: string,
  professionalUserId: string,
): Promise<SurgeryForProfessional[]> {
  const rows = await db
    .select({
      surgery: surgeries,
      clinicName: users.fullName,
      clinicCity: users.city,
      clinicAvatarUrl: users.avatarUrl,
      myStatus: applications.status,
      myApplicationId: applications.id,
    })
    .from(surgeries)
    .innerJoin(users, eq(users.id, surgeries.clinicId))
    .leftJoin(
      applications,
      and(
        eq(applications.surgeryId, surgeries.id),
        eq(applications.professionalId, professionalUserId),
      ),
    )
    .where(
      and(
        eq(surgeries.specialtyId, specialtyId),
        eq(surgeries.status, "open"),
        gte(surgeries.date, todayStr()),
        isNull(surgeries.deletedAt),
      ),
    )
    .orderBy(asc(surgeries.date));
  return rows;
}

export type SurgeryWithCounts = Surgery & {
  /** Total de postulaciones (cualquier estado). */
  applicantCount: number;
  /** Postulaciones aún pendientes de decidir. */
  pendingCount: number;
  /** Plazas ya confirmadas. */
  confirmedCount: number;
};

/**
 * Cirugías de una clínica con los contadores de candidatos por estado, para su
 * panel de gestión. Dos queries (lista + agregación) que se cruzan en memoria;
 * suficiente para el volumen actual.
 */
export async function listSurgeriesByClinicWithCounts(
  clinicId: string,
): Promise<SurgeryWithCounts[]> {
  const surgs = await db
    .select()
    .from(surgeries)
    .where(and(eq(surgeries.clinicId, clinicId), isNull(surgeries.deletedAt)))
    .orderBy(desc(surgeries.createdAt));
  if (surgs.length === 0) return [];

  const counts = await db
    .select({
      surgeryId: applications.surgeryId,
      applicantCount: sql<number>`count(*)::int`,
      pendingCount: sql<number>`(count(*) filter (where ${applications.status} = 'applied'))::int`,
      confirmedCount: sql<number>`(count(*) filter (where ${applications.status} = 'confirmed'))::int`,
    })
    .from(applications)
    .where(
      inArray(
        applications.surgeryId,
        surgs.map((s) => s.id),
      ),
    )
    .groupBy(applications.surgeryId);

  const byId = new Map(counts.map((c) => [c.surgeryId, c]));
  return surgs.map((s) => {
    const c = byId.get(s.id);
    return {
      ...s,
      applicantCount: c?.applicantCount ?? 0,
      pendingCount: c?.pendingCount ?? 0,
      confirmedCount: c?.confirmedCount ?? 0,
    };
  });
}

// ===========================================================================
// SUPERVISIÓN ADMIN — vistas globales (toda la plataforma, solo lectura)
// ===========================================================================

export type AdminSurgeryRow = SurgeryWithCounts & { clinicName: string };

/** Todas las cirugías de la plataforma con contadores y nombre de la clínica. */
export async function listAllSurgeriesWithCounts(): Promise<AdminSurgeryRow[]> {
  const rows = await db
    .select({ surgery: surgeries, clinicName: users.fullName })
    .from(surgeries)
    .innerJoin(users, eq(users.id, surgeries.clinicId))
    .where(isNull(surgeries.deletedAt))
    .orderBy(desc(surgeries.createdAt));
  if (rows.length === 0) return [];

  const counts = await db
    .select({
      surgeryId: applications.surgeryId,
      applicantCount: sql<number>`count(*)::int`,
      pendingCount: sql<number>`(count(*) filter (where ${applications.status} = 'applied'))::int`,
      confirmedCount: sql<number>`(count(*) filter (where ${applications.status} = 'confirmed'))::int`,
    })
    .from(applications)
    .groupBy(applications.surgeryId);

  const byId = new Map(counts.map((c) => [c.surgeryId, c]));
  return rows.map(({ surgery, clinicName }) => {
    const c = byId.get(surgery.id);
    return {
      ...surgery,
      clinicName,
      applicantCount: c?.applicantCount ?? 0,
      pendingCount: c?.pendingCount ?? 0,
      confirmedCount: c?.confirmedCount ?? 0,
    };
  });
}

export type SurgeryWithClinic = {
  surgery: Surgery;
  clinicName: string;
  clinicCity: string | null;
  clinicAvatarUrl: string | null;
};

/** Todas las cirugías abiertas y futuras (cualquier especialidad), con su clínica. */
export async function listAllOpenSurgeries(): Promise<SurgeryWithClinic[]> {
  return db
    .select({
      surgery: surgeries,
      clinicName: users.fullName,
      clinicCity: users.city,
      clinicAvatarUrl: users.avatarUrl,
    })
    .from(surgeries)
    .innerJoin(users, eq(users.id, surgeries.clinicId))
    .where(and(eq(surgeries.status, "open"), gte(surgeries.date, todayStr()), isNull(surgeries.deletedAt)))
    .orderBy(asc(surgeries.date));
}

/** Una cirugía con el nombre de su clínica (para el detalle de supervisión). */
export async function getSurgeryWithClinic(id: string): Promise<SurgeryWithClinic | null> {
  const rows = await db
    .select({
      surgery: surgeries,
      clinicName: users.fullName,
      clinicCity: users.city,
      clinicAvatarUrl: users.avatarUrl,
    })
    .from(surgeries)
    .innerJoin(users, eq(users.id, surgeries.clinicId))
    .where(and(eq(surgeries.id, id), isNull(surgeries.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Soft-delete: oculta la cirugía de todos los listados sin borrarla de la BD
 * (reversible). La usa el admin para retirar cirugías. Se conserva el dato.
 */
export async function softDeleteSurgery(id: string): Promise<void> {
  await db
    .update(surgeries)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(surgeries.id, id));
}

/** Restaura una cirugía soft-deleted (vuelve a aparecer en los listados). */
export async function restoreSurgery(id: string): Promise<void> {
  await db
    .update(surgeries)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(surgeries.id, id));
}
