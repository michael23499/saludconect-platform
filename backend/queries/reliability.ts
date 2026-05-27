import { and, eq, isNotNull, or, sql } from "drizzle-orm";
import { db, applications, surgeries, availabilitySlots } from "../db";
import {
  classifyCancellation,
  leadHoursBetween,
  RELIABILITY_PENALTY,
  type CancellationSeverity,
} from "../policy/reservation";

export type Reliability = {
  /** 0–100. 100 = sin incidencias. Cuanto más bajo, menos fiable. */
  score: number;
  /** Cancelaciones tardías (dentro de 72 h, sin contar las "libres"). */
  lateCancellations: number;
  /** Ausencias a una reserva confirmada (no-shows). */
  noShows: number;
  /** Nº de compromisos confirmados (contexto). */
  commitments: number;
  /** false si la persona aún no tiene ningún compromiso del que valorar fiabilidad. */
  hasHistory: boolean;
};

/** Suma de penalizaciones de una lista de incidencias → score 0–100. */
function scoreFrom(severities: CancellationSeverity[]): number {
  const total = severities.reduce((acc, s) => acc + RELIABILITY_PENALTY[s], 0);
  return Math.max(0, 100 - total);
}

/**
 * Fiabilidad de un usuario (clínica o profesional) calculada a partir de sus
 * cancelaciones de reservas confirmadas y sus ausencias. NO se guarda en BD: se
 * deriva de las columnas cancelledBy/cancelledAt/attended de applications y
 * availability_slots, usando las mismas ventanas 72h/24h que la política.
 *
 * - Profesional: cuentan sus cancelaciones (cancelledBy='professional') y sus
 *   no-shows (attended=false), tanto en cirugías como en disponibilidad.
 * - Clínica: cuentan las cancelaciones de cirugías con confirmados
 *   (cancelledBy='clinic'). Las acciones de un admin (soporte) no penalizan.
 */
export async function getReliability(userId: string): Promise<Reliability> {
  const severities: CancellationSeverity[] = [];
  let lateCancellations = 0;
  let noShows = 0;

  function addCancellation(cancelledAt: Date | null, date: string, startTime: string | null) {
    const lead = cancelledAt ? leadHoursBetween(cancelledAt, date, startTime) : 0;
    const severity = classifyCancellation(lead);
    if (severity === "free") return; // cancelar con antelación suficiente no penaliza
    severities.push(severity);
    lateCancellations++;
  }
  function addNoShow() {
    severities.push("no_show");
    noShows++;
  }

  // --- Profesional: incidencias en cirugías ---
  const proApps = await db
    .select({
      cancelledBy: applications.cancelledBy,
      cancelledAt: applications.cancelledAt,
      attended: applications.attended,
      date: surgeries.date,
      startTime: surgeries.startTime,
    })
    .from(applications)
    .innerJoin(surgeries, eq(surgeries.id, applications.surgeryId))
    .where(
      and(
        eq(applications.professionalId, userId),
        or(eq(applications.cancelledBy, "professional"), eq(applications.attended, false)),
      ),
    );
  for (const r of proApps) {
    if (r.attended === false) addNoShow();
    else if (r.cancelledBy === "professional") addCancellation(r.cancelledAt, r.date, r.startTime);
  }

  // --- Profesional: incidencias en disponibilidad ---
  const proSlots = await db
    .select({
      cancelledBy: availabilitySlots.cancelledBy,
      cancelledAt: availabilitySlots.cancelledAt,
      attended: availabilitySlots.attended,
      date: availabilitySlots.date,
      startTime: availabilitySlots.startTime,
    })
    .from(availabilitySlots)
    .where(
      and(
        eq(availabilitySlots.professionalId, userId),
        or(eq(availabilitySlots.cancelledBy, "professional"), eq(availabilitySlots.attended, false)),
      ),
    );
  for (const r of proSlots) {
    if (r.attended === false) addNoShow();
    else if (r.cancelledBy === "professional") addCancellation(r.cancelledAt, r.date, r.startTime);
  }

  // --- Clínica: cancelaciones de cirugías con confirmados ---
  const clinicApps = await db
    .select({
      cancelledAt: applications.cancelledAt,
      date: surgeries.date,
      startTime: surgeries.startTime,
    })
    .from(applications)
    .innerJoin(surgeries, eq(surgeries.id, applications.surgeryId))
    .where(and(eq(surgeries.clinicId, userId), eq(applications.cancelledBy, "clinic")));
  for (const r of clinicApps) addCancellation(r.cancelledAt, r.date, r.startTime);

  // Compromisos confirmados (contexto + saber si hay historial). Profesional:
  // applications con confirmedAt; clínica: confirmados en sus cirugías.
  const commitmentRows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(applications)
    .innerJoin(surgeries, eq(surgeries.id, applications.surgeryId))
    .where(
      and(
        isNotNull(applications.confirmedAt),
        or(eq(applications.professionalId, userId), eq(surgeries.clinicId, userId)),
      ),
    );
  const commitments = commitmentRows[0]?.n ?? 0;

  return {
    score: scoreFrom(severities),
    lateCancellations,
    noShows,
    commitments,
    hasHistory: commitments > 0 || severities.length > 0,
  };
}
