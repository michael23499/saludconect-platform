/**
 * Formateo de fechas del marketplace. Las columnas `date` de Drizzle llegan como
 * string "YYYY-MM-DD"; las parseamos a mediodía para evitar saltos de día por
 * zona horaria.
 */
function atNoon(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

/** "mar, 28 may" */
export function formatDateEs(dateStr: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(atNoon(dateStr));
}

/** "martes, 28 de mayo de 2026" */
export function formatDateLongEs(dateStr: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(atNoon(dateStr));
}

/** Fecha de hoy como "YYYY-MM-DD" (para comparar con columnas `date`). */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Día y mes corto por separado, para las "tarjetas calendario". */
export function dayMonth(dateStr: string): { day: string; mon: string } {
  const d = atNoon(dateStr);
  return {
    day: new Intl.DateTimeFormat("es-ES", { day: "2-digit" }).format(d),
    mon: new Intl.DateTimeFormat("es-ES", { month: "short" }).format(d).replace(".", ""),
  };
}
