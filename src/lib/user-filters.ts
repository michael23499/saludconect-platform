import type { UserFilters } from "@backend/queries/users";

const VALID_ROLES = ["professional", "clinic", "admin"] as const;

/** Valida una fecha en formato YYYY-MM-DD; devuelve Date a medianoche local o null. */
function parseISODate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Convierte los parámetros crudos de la URL (?role=&from=&to=&q=) en un
 * `UserFilters` validado. Compartido por la página /admin/users y su endpoint de
 * export para que ambos apliquen exactamente los mismos filtros.
 */
export function buildUserFilters(raw: {
  role?: string;
  from?: string;
  to?: string;
  q?: string;
}): UserFilters {
  const filters: UserFilters = {};

  if (raw.role && (VALID_ROLES as readonly string[]).includes(raw.role)) {
    filters.role = raw.role as UserFilters["role"];
  }

  const from = parseISODate(raw.from);
  if (from) filters.since = from; // createdAt >= inicio del día "desde"

  const to = parseISODate(raw.to);
  if (to) {
    to.setHours(23, 59, 59, 999); // createdAt <= fin del día "hasta"
    filters.until = to;
  }

  if (raw.q && raw.q.trim()) filters.search = raw.q.trim();

  return filters;
}
