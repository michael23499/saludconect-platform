import { and, desc, eq, gte, lte, ilike, or, type SQL } from "drizzle-orm";
import { db, users, type User, type NewUser } from "../db";

export async function getUserProfileById(id: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export type UserFilters = {
  role?: User["role"];
  /** Solo usuarios dados de alta a partir de esta fecha (createdAt >= since). */
  since?: Date;
  /** Solo usuarios dados de alta hasta esta fecha inclusive (createdAt <= until). */
  until?: Date;
  /** Búsqueda parcial case-insensitive sobre nombre y email. */
  search?: string;
};

/**
 * Lista perfiles de public.users con filtros opcionales, los más recientes
 * primero. Uso: panel admin (/admin/users) y su export — ambos comparten esta
 * función para que el Excel respete los mismos filtros que la tabla.
 * Sin paginar todavía: fase early-stage con pocos usuarios; añadir paginación
 * cuando el volumen lo justifique.
 */
/** Tamaño de página por defecto para la tabla admin con lazy load. */
export const USERS_PAGE_SIZE = 25;

export async function listUsers(
  filters: UserFilters = {},
  limit?: number,
  offset = 0,
): Promise<User[]> {
  const conds: SQL[] = [];
  if (filters.role) conds.push(eq(users.role, filters.role));
  if (filters.since) conds.push(gte(users.createdAt, filters.since));
  if (filters.until) conds.push(lte(users.createdAt, filters.until));
  if (filters.search) {
    const q = `%${filters.search}%`;
    // Busca en nombre, email, teléfono y ciudad.
    conds.push(
      or(
        ilike(users.fullName, q),
        ilike(users.email, q),
        ilike(users.phone, q),
        ilike(users.city, q),
      )!,
    );
  }
  const base = db
    .select()
    .from(users)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(users.createdAt));

  return limit != null ? base.limit(limit).offset(offset) : base;
}

// --- Mutaciones de admin --------------------------------------------------
// Solo deben invocarse desde server actions protegidas con requireRole("admin").
// No re-verifican permisos: esa responsabilidad es del action que las llama.

export async function updateUserRole(id: string, role: User["role"]): Promise<void> {
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function setUserVerified(id: string, verified: boolean): Promise<void> {
  await db.update(users).set({ verified, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function setUserSuspended(id: string, suspended: boolean): Promise<void> {
  await db.update(users).set({ suspended, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function updateUserProfile(
  id: string,
  data: {
    fullName: string;
    phone: string | null;
    city: string | null;
    address: string | null;
    postalCode: string | null;
    lat: number | null;
    lng: number | null;
  },
): Promise<void> {
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function updateUserAvatar(id: string, avatarUrl: string): Promise<void> {
  await db.update(users).set({ avatarUrl, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function createUserProfile(data: NewUser): Promise<User | null> {
  // onConflictDoNothing: si el perfil ya existe (doble submit / race), no
  // reventamos con error de PK duplicada; devolvemos null y el caller redirige.
  const rows = await db.insert(users).values(data).onConflictDoNothing().returning();
  return rows[0] ?? null;
}
