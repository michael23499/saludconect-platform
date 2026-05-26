import { and, desc, eq, inArray, isNull, lt, sql } from "drizzle-orm";
import {
  db,
  reviews,
  users,
  surgeries,
  applications,
  availabilitySlots,
  type Review,
  type NewReview,
} from "../db";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Crea una valoración. Idempotente: si ya existe (mismo rater/rated/trabajo), no duplica. */
export async function createReview(data: NewReview): Promise<Review | null> {
  const rows = await db
    .insert(reviews)
    .values(data)
    .onConflictDoNothing({
      target: [reviews.raterId, reviews.ratedId, reviews.contextType, reviews.contextId],
    })
    .returning();
  return rows[0] ?? null;
}

export type RatingSummary = { average: number; count: number };

/** Media (1-5) y nº de valoraciones RECIBIDAS por un usuario. */
export async function getRatingSummary(ratedId: string): Promise<RatingSummary> {
  const rows = await db
    .select({
      average: sql<number>`coalesce(avg(${reviews.rating}), 0)::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.ratedId, ratedId));
  return { average: rows[0]?.average ?? 0, count: rows[0]?.count ?? 0 };
}

/** Resúmenes de varios usuarios a la vez (para listados: directorio). */
export async function getRatingSummaries(
  ratedIds: string[],
): Promise<Record<string, RatingSummary>> {
  if (ratedIds.length === 0) return {};
  const rows = await db
    .select({
      ratedId: reviews.ratedId,
      average: sql<number>`coalesce(avg(${reviews.rating}), 0)::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(inArray(reviews.ratedId, ratedIds))
    .groupBy(reviews.ratedId);
  const map: Record<string, RatingSummary> = {};
  for (const r of rows) map[r.ratedId] = { average: r.average, count: r.count };
  return map;
}

export type ReviewWithRater = {
  review: Review;
  raterName: string;
  raterAvatarUrl: string | null;
};

/** Valoraciones recibidas por un usuario, con quién las dejó (para su perfil). */
export async function listReviewsFor(ratedId: string, limit = 20): Promise<ReviewWithRater[]> {
  return db
    .select({ review: reviews, raterName: users.fullName, raterAvatarUrl: users.avatarUrl })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.raterId))
    .where(eq(reviews.ratedId, ratedId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export type PendingReview = {
  contextType: "surgery" | "slot";
  contextId: string;
  ratedId: string;
  ratedName: string;
  ratedAvatarUrl: string | null;
  /** Título del trabajo (la cirugía) o null para una reserva de disponibilidad. */
  title: string | null;
  date: string;
};

/**
 * Trabajos TERMINADOS (fecha ya pasada) que el usuario aún no ha valorado, en
 * los dos flujos: cirugías confirmadas y reservas de disponibilidad aceptadas.
 * Cubre el rol que tenga el usuario (clínica o profesional) buscando donde
 * participó. La doble dirección (clínica↔profesional) se resuelve según quién
 * consulta: siempre valora a la "otra parte".
 */
export async function listPendingReviewsForUser(userId: string): Promise<PendingReview[]> {
  const today = todayStr();
  const out: PendingReview[] = [];

  // (1) Cirugías donde el usuario es la CLÍNICA → valorar a cada profesional confirmado.
  const asClinicSurgeries = await db
    .select({
      contextId: surgeries.id,
      ratedId: applications.professionalId,
      ratedName: users.fullName,
      ratedAvatarUrl: users.avatarUrl,
      title: surgeries.title,
      date: surgeries.date,
    })
    .from(surgeries)
    .innerJoin(
      applications,
      and(eq(applications.surgeryId, surgeries.id), eq(applications.status, "confirmed")),
    )
    .innerJoin(users, eq(users.id, applications.professionalId))
    .leftJoin(
      reviews,
      and(
        eq(reviews.raterId, userId),
        eq(reviews.ratedId, applications.professionalId),
        eq(reviews.contextType, "surgery"),
        eq(reviews.contextId, surgeries.id),
      ),
    )
    .where(
      and(
        eq(surgeries.clinicId, userId),
        lt(surgeries.date, today),
        isNull(surgeries.deletedAt),
        isNull(reviews.id),
      ),
    );
  for (const r of asClinicSurgeries) out.push({ contextType: "surgery", ...r });

  // (2) Cirugías donde el usuario es el PROFESIONAL confirmado → valorar a la clínica.
  const asProSurgeries = await db
    .select({
      contextId: surgeries.id,
      ratedId: surgeries.clinicId,
      ratedName: users.fullName,
      ratedAvatarUrl: users.avatarUrl,
      title: surgeries.title,
      date: surgeries.date,
    })
    .from(surgeries)
    .innerJoin(
      applications,
      and(
        eq(applications.surgeryId, surgeries.id),
        eq(applications.professionalId, userId),
        eq(applications.status, "confirmed"),
      ),
    )
    .innerJoin(users, eq(users.id, surgeries.clinicId))
    .leftJoin(
      reviews,
      and(
        eq(reviews.raterId, userId),
        eq(reviews.ratedId, surgeries.clinicId),
        eq(reviews.contextType, "surgery"),
        eq(reviews.contextId, surgeries.id),
      ),
    )
    .where(and(lt(surgeries.date, today), isNull(surgeries.deletedAt), isNull(reviews.id)))
    .then((rows) => rows);
  for (const r of asProSurgeries) out.push({ contextType: "surgery", ...r });

  // (3) Reservas (slots) donde el usuario es la CLÍNICA → valorar al profesional.
  const asClinicSlots = await db
    .select({
      contextId: availabilitySlots.id,
      ratedId: availabilitySlots.professionalId,
      ratedName: users.fullName,
      ratedAvatarUrl: users.avatarUrl,
      date: availabilitySlots.date,
    })
    .from(availabilitySlots)
    .innerJoin(users, eq(users.id, availabilitySlots.professionalId))
    .leftJoin(
      reviews,
      and(
        eq(reviews.raterId, userId),
        eq(reviews.ratedId, availabilitySlots.professionalId),
        eq(reviews.contextType, "slot"),
        eq(reviews.contextId, availabilitySlots.id),
      ),
    )
    .where(
      and(
        eq(availabilitySlots.bookedByClinicId, userId),
        eq(availabilitySlots.status, "booked"),
        lt(availabilitySlots.date, today),
        isNull(reviews.id),
      ),
    );
  for (const r of asClinicSlots) out.push({ contextType: "slot", title: null, ...r });

  // (4) Reservas (slots) donde el usuario es el PROFESIONAL → valorar a la clínica.
  const asProSlots = await db
    .select({
      contextId: availabilitySlots.id,
      ratedId: sql<string>`${availabilitySlots.bookedByClinicId}`,
      ratedName: users.fullName,
      ratedAvatarUrl: users.avatarUrl,
      date: availabilitySlots.date,
    })
    .from(availabilitySlots)
    .innerJoin(users, eq(users.id, availabilitySlots.bookedByClinicId))
    .leftJoin(
      reviews,
      and(
        eq(reviews.raterId, userId),
        eq(reviews.ratedId, availabilitySlots.bookedByClinicId),
        eq(reviews.contextType, "slot"),
        eq(reviews.contextId, availabilitySlots.id),
      ),
    )
    .where(
      and(
        eq(availabilitySlots.professionalId, userId),
        eq(availabilitySlots.status, "booked"),
        lt(availabilitySlots.date, today),
        isNull(reviews.id),
      ),
    );
  for (const r of asProSlots) out.push({ contextType: "slot", title: null, ...r });

  return out;
}
