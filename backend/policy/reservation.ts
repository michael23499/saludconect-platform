/**
 * Constantes y helpers de la Política de Reservas (ver /legal/reservations y la
 * sección "Cómo aplicamos esta política"). Centraliza las ventanas de
 * cancelación 72h/24h y la clasificación de gravedad, para que el cálculo de
 * fiabilidad (reputación) y la UI usen exactamente las mismas reglas.
 *
 * Módulo de constantes puras: SaludCoNet no mueve dinero — la única consecuencia
 * automática es la reputación. Cualquier penalización económica se acuerda entre
 * las partes, al margen de la plataforma.
 */

/** Versión vigente de la política. Coincide con la fecha "updated" de la página. */
export const RESERVATION_POLICY_VERSION = "2026-05-27";

/** Con MÁS de estas horas de antelación, cancelar no penaliza. */
export const CANCELLATION_FREE_HOURS = 72;
/** Con MENOS de estas horas de antelación, la cancelación es una falta fuerte. */
export const CANCELLATION_STRICT_HOURS = 24;

// free: sin penalización (>=72h) · late: falta leve (24–72h) · severe: falta
// fuerte (<24h) · no_show: no presentarse (la más grave; se marca tras la fecha).
export type CancellationSeverity = "free" | "late" | "severe" | "no_show";

/** Quién cancela una reserva confirmada (se guarda como texto en BD). */
export type CancelledBy = "clinic" | "professional" | "admin";

/** Cuánto resta cada gravedad a la fiabilidad (0–100). El no-show es el mayor. */
export const RELIABILITY_PENALTY: Record<CancellationSeverity, number> = {
  free: 0,
  late: 8,
  severe: 18,
  no_show: 30,
};

/**
 * Horas de antelación entre AHORA y el inicio del trabajo. Si no hay hora de
 * inicio, asumimos las 09:00 (inicio típico de jornada). Aproximación suficiente
 * para clasificar la ventana; la zona horaria del servidor introduce un margen
 * de 1–2h que no cambia el tramo en la práctica.
 */
export function leadHoursUntil(dateStr: string, startTime?: string | null): number {
  return leadHoursBetween(new Date(), dateStr, startTime);
}

/**
 * Horas de antelación entre `from` (p.ej. el momento en que se canceló) y el
 * inicio del trabajo. Sirve para reclasificar la gravedad de una cancelación a
 * partir de `cancelledAt` y la fecha del trabajo (sin guardar la gravedad en BD).
 */
export function leadHoursBetween(from: Date, dateStr: string, startTime?: string | null): number {
  const time = startTime && /^\d{2}:\d{2}/.test(startTime) ? startTime.slice(0, 5) : "09:00";
  const start = new Date(`${dateStr}T${time}:00`);
  return (start.getTime() - from.getTime()) / 3_600_000;
}

/**
 * Clasifica una cancelación por su antelación: >=72h libre, 24–72h leve, <24h
 * fuerte. El no-show no se deduce de aquí (se marca explícitamente tras la fecha).
 */
export function classifyCancellation(leadHours: number): Exclude<CancellationSeverity, "no_show"> {
  if (leadHours >= CANCELLATION_FREE_HOURS) return "free";
  if (leadHours >= CANCELLATION_STRICT_HOURS) return "late";
  return "severe";
}
