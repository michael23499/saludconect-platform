import { and, desc, eq, gte, isNotNull, ne, sql } from "drizzle-orm";
import { db, users, surgeries, professionals, specialties, type User } from "../db";

// ===========================================================================
// ESTADÍSTICAS DE PLATAFORMA — panel admin (datos reales, sin mocks)
// ===========================================================================

export type AdminStats = {
  totalUsers: number;
  totalClinics: number;
  totalProfessionals: number;
  newUsersThisWeek: number;
  pendingApprovals: number;
  verifiedUsers: number;
  suspendedUsers: number;
  surgeries: { total: number; open: number; filled: number; completed: number; cancelled: number };
  topCities: { city: string; count: number }[];
  /** Cirugías creadas por día, últimos 14 días (rellenado con ceros). */
  activity: { date: string; count: number }[];
};

/**
 * Agregados reales para /admin y /admin/stats. Una query por tabla con
 * `count(*) filter (...)` para no traer filas a memoria. Excluye el rol admin
 * de las "aprobaciones pendientes" (los admins entran verificados).
 */
/**
 * Conteo barato (un solo count) de perfiles pendientes de aprobación, para el
 * badge del nav admin. Mismos criterios que `pendingApprovals` de getAdminStats:
 * sin verificar, sin suspender y que no sean admin.
 */
export async function countPendingApprovals(): Promise<number> {
  const [r] = await db
    .select({
      n: sql<number>`(count(*) filter (where ${users.verified} = false and ${users.suspended} = false and ${users.role} <> 'admin'))::int`,
    })
    .from(users);
  return r?.n ?? 0;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [u] = await db
    .select({
      total: sql<number>`count(*)::int`,
      clinics: sql<number>`(count(*) filter (where ${users.role} = 'clinic'))::int`,
      professionals: sql<number>`(count(*) filter (where ${users.role} = 'professional'))::int`,
      verified: sql<number>`(count(*) filter (where ${users.verified} = true))::int`,
      suspended: sql<number>`(count(*) filter (where ${users.suspended} = true))::int`,
      pending: sql<number>`(count(*) filter (where ${users.verified} = false and ${users.suspended} = false and ${users.role} <> 'admin'))::int`,
      newThisWeek: sql<number>`(count(*) filter (where ${users.createdAt} >= now() - interval '7 days'))::int`,
    })
    .from(users);

  const [s] = await db
    .select({
      total: sql<number>`count(*)::int`,
      open: sql<number>`(count(*) filter (where ${surgeries.status} = 'open'))::int`,
      filled: sql<number>`(count(*) filter (where ${surgeries.status} = 'filled'))::int`,
      completed: sql<number>`(count(*) filter (where ${surgeries.status} = 'completed'))::int`,
      cancelled: sql<number>`(count(*) filter (where ${surgeries.status} = 'cancelled'))::int`,
    })
    .from(surgeries);

  const cities = await db
    .select({ city: users.city, count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(isNotNull(users.city), ne(users.city, "")))
    .groupBy(users.city)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const rawActivity = await db
    .select({
      day: sql<string>`to_char(${surgeries.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(surgeries)
    .where(gte(surgeries.createdAt, sql`now() - interval '14 days'`))
    .groupBy(sql`to_char(${surgeries.createdAt}, 'YYYY-MM-DD')`);

  const byDay = new Map(rawActivity.map((r) => [r.day, r.count]));
  const activity: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    activity.push({ date: key, count: byDay.get(key) ?? 0 });
  }

  return {
    totalUsers: u?.total ?? 0,
    totalClinics: u?.clinics ?? 0,
    totalProfessionals: u?.professionals ?? 0,
    newUsersThisWeek: u?.newThisWeek ?? 0,
    pendingApprovals: u?.pending ?? 0,
    verifiedUsers: u?.verified ?? 0,
    suspendedUsers: u?.suspended ?? 0,
    surgeries: {
      total: s?.total ?? 0,
      open: s?.open ?? 0,
      filled: s?.filled ?? 0,
      completed: s?.completed ?? 0,
      cancelled: s?.cancelled ?? 0,
    },
    topCities: cities.map((c) => ({ city: c.city ?? "", count: c.count })),
    activity,
  };
}

export type PendingApproval = {
  id: string;
  fullName: string;
  role: User["role"];
  city: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  specialtyName: string | null;
};

/**
 * Perfiles reales pendientes de verificación (no verificados y no suspendidos),
 * los más recientes primero. Incluye la especialidad si es profesional. El admin
 * los aprueba (verifica) o rechaza (suspende) desde la cola.
 */
export async function listPendingApprovals(limit?: number): Promise<PendingApproval[]> {
  const base = db
    .select({
      id: users.id,
      fullName: users.fullName,
      role: users.role,
      city: users.city,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
      specialtyName: specialties.name,
    })
    .from(users)
    .leftJoin(professionals, eq(professionals.id, users.id))
    .leftJoin(specialties, eq(specialties.id, professionals.specialtyId))
    .where(and(eq(users.verified, false), eq(users.suspended, false), ne(users.role, "admin")))
    .orderBy(desc(users.createdAt));
  return limit != null ? base.limit(limit) : base;
}
