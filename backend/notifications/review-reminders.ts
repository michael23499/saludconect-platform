import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, surgeries, applications, availabilitySlots, users, type NewNotification } from "../db";
import { createNotifications } from "../queries/notifications";

const CLINIC_HOME = "/dashboard/clinic";
const PRO_HOME = "/dashboard/professional";

/**
 * Genera las notificaciones "valora tu experiencia" para los trabajos que
 * TERMINARON en la fecha indicada (normalmente "ayer"): cirugías confirmadas y
 * reservas de disponibilidad aceptadas. Avisa a AMBAS partes (clínica ↔
 * profesional). Pensado para ejecutarse una vez al día desde el cron. Devuelve
 * cuántas notificaciones creó.
 */
export async function sendReviewReminders(dateStr: string): Promise<number> {
  const notifs: NewNotification[] = [];

  // --- Cirugías confirmadas de esa fecha: clínica ↔ cada profesional ---
  const clinicU = alias(users, "clinic_u");
  const proU = alias(users, "pro_u");
  const surg = await db
    .select({
      clinicId: surgeries.clinicId,
      clinicName: clinicU.fullName,
      proId: applications.professionalId,
      proName: proU.fullName,
      title: surgeries.title,
    })
    .from(surgeries)
    .innerJoin(
      applications,
      and(eq(applications.surgeryId, surgeries.id), eq(applications.status, "confirmed")),
    )
    .innerJoin(clinicU, eq(clinicU.id, surgeries.clinicId))
    .innerJoin(proU, eq(proU.id, applications.professionalId))
    .where(and(eq(surgeries.date, dateStr), isNull(surgeries.deletedAt)));
  for (const r of surg) {
    notifs.push({
      userId: r.clinicId,
      type: "review_request",
      title: "Valora tu experiencia",
      body: `¿Cómo fue tu colaboración con ${r.proName} en «${r.title}»? Deja tu valoración.`,
      link: CLINIC_HOME,
    });
    notifs.push({
      userId: r.proId,
      type: "review_request",
      title: "Valora tu experiencia",
      body: `¿Cómo fue trabajar con ${r.clinicName} en «${r.title}»? Deja tu valoración.`,
      link: PRO_HOME,
    });
  }

  // --- Reservas (slots) aceptadas de esa fecha: clínica ↔ profesional ---
  const proU2 = alias(users, "pro_u2");
  const clinicU2 = alias(users, "clinic_u2");
  const slots = await db
    .select({
      proId: availabilitySlots.professionalId,
      proName: proU2.fullName,
      clinicId: availabilitySlots.bookedByClinicId,
      clinicName: clinicU2.fullName,
    })
    .from(availabilitySlots)
    .innerJoin(proU2, eq(proU2.id, availabilitySlots.professionalId))
    .innerJoin(clinicU2, eq(clinicU2.id, availabilitySlots.bookedByClinicId))
    .where(and(eq(availabilitySlots.date, dateStr), eq(availabilitySlots.status, "booked")));
  for (const r of slots) {
    if (!r.clinicId) continue;
    notifs.push({
      userId: r.clinicId,
      type: "review_request",
      title: "Valora tu experiencia",
      body: `¿Cómo fue la reserva con ${r.proName}? Deja tu valoración.`,
      link: CLINIC_HOME,
    });
    notifs.push({
      userId: r.proId,
      type: "review_request",
      title: "Valora tu experiencia",
      body: `¿Cómo fue la reserva con ${r.clinicName}? Deja tu valoración.`,
      link: PRO_HOME,
    });
  }

  if (notifs.length > 0) await createNotifications(notifs);
  return notifs.length;
}
