"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../auth/guards";
import { getProfessionalById } from "../queries/professionals";
import { getUserProfileById } from "../queries/users";
import {
  createAvailabilitySlot,
  getAvailabilitySlotById,
  requestSlot,
  acceptBooking,
  rejectBooking,
  cancelSlot,
} from "../queries/availability";
import { notify } from "../notifications/notify";
import { renderEmail } from "../notifications/email";
import { notOwner } from "../lib/authz";
import { formatDateEs, todayStr } from "@/lib/dates";
import { formatSchedule } from "@/lib/surgery";
import { ROUTES } from "@/lib/routes";

const PRO_CAL = ROUTES.proCalendar;
const CLINIC_CAL = ROUTES.clinicCalendar;

export type ActionResult = { ok: true } | { error: string };
export type PublishAvailabilityState = ActionResult | null;

/**
 * El técnico publica una franja de disponibilidad (día completo o con horario).
 * Queda "open" y visible para que las clínicas la reserven directamente.
 */
export async function publishAvailabilityAction(
  _prev: PublishAvailabilityState,
  formData: FormData,
): Promise<PublishAvailabilityState> {
  const pro = await requireRole("professional");
  if (pro.profile.role === "admin") {
    return { error: "admin_supervises" };
  }

  // Una o varias fechas (CSV): el cliente las calcula (día único o rango con
  // días de la semana). Aceptamos también `date` por compatibilidad.
  const raw = ((formData.get("dates") as string) || (formData.get("date") as string) || "").trim();
  const dates = Array.from(new Set(raw.split(",").map((s) => s.trim()).filter(Boolean)));
  if (dates.length === 0) return { error: "need_date" };
  if (dates.length > 90) return { error: "too_many_dates" };

  const today = todayStr();
  for (const d of dates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return { error: "invalid_date" };
    if (d < today) return { error: "past_date" };
  }

  const startTime = (formData.get("startTime") as string) || null;
  const endTime = (formData.get("endTime") as string) || null;
  if (startTime && endTime && endTime <= startTime) {
    return { error: "end_before_start" };
  }
  const note = ((formData.get("note") as string) || "").trim() || null;
  const city = ((formData.get("city") as string) || "").trim() || null;

  const professional = await getProfessionalById(pro.profile.id);

  await Promise.all(
    dates.map((date) =>
      createAvailabilitySlot({
        professionalId: pro.profile.id,
        specialtyId: professional?.specialtyId ?? null,
        date,
        startTime,
        endTime,
        city,
        note,
        status: "open",
      }),
    ),
  );

  revalidatePath(PRO_CAL);
  revalidatePath(CLINIC_CAL);
  return { ok: true };
}

/**
 * El técnico retira una franja. Si solo estaba libre/pendiente, es una retirada
 * sin consecuencias. Si estaba reservada EN FIRME (booked), es una cancelación de
 * un compromiso: exige motivo, queda registrada (afecta a la fiabilidad según la
 * antelación 72h/24h) y avisa a la clínica.
 */
export async function cancelAvailabilityAction(
  slotId: string,
  reason?: string,
): Promise<ActionResult> {
  const pro = await requireRole("professional");
  if (pro.profile.role === "admin") return { error: "admin_supervises" };

  const slot = await getAvailabilitySlotById(slotId);
  if (!slot) return { error: "slot_gone" };
  if (notOwner(slot.professionalId, pro.profile.id)) {
    return { error: "not_owner" };
  }
  if (slot.status === "cancelled") return { ok: true };

  // Reserva en firme → cancelación de compromiso: motivo obligatorio y registro.
  if (slot.status === "booked") {
    const cleanReason = reason?.trim();
    if (!cleanReason) return { error: "reason_required" };
    await cancelSlot(slotId, { cancelledBy: "professional", reason: cleanReason });
  } else {
    await cancelSlot(slotId);
  }

  // Si había una reserva (confirmada o pendiente), avisar a la clínica.
  if ((slot.status === "booked" || slot.status === "pending") && slot.bookedByClinicId) {
    const clinic = await getUserProfileById(slot.bookedByClinicId);
    if (clinic) {
      await notify({
        userId: clinic.id,
        type: "slot_booked",
        title: "Reserva cancelada por el técnico",
        body: `${pro.profile.fullName} ha cancelado la disponibilidad que reservaste para el ${formatDateEs(slot.date)}.`,
        link: CLINIC_CAL,
        email: {
          to: clinic.email,
          subject: "Una reserva de disponibilidad se ha cancelado",
          html: renderEmail({
            heading: "Reserva cancelada",
            intro: `${pro.profile.fullName} ha cancelado la disponibilidad que habías reservado.`,
            lines: [`📅 ${formatDateEs(slot.date)}`],
            ctaText: "Buscar otros técnicos",
            ctaPath: CLINIC_CAL,
          }),
        },
      });
    }
  }

  revalidatePath(PRO_CAL);
  revalidatePath(CLINIC_CAL);
  return { ok: true };
}

function timeOf(slot: { startTime: string | null; endTime: string | null }): string {
  return formatSchedule(slot.startTime, slot.endTime);
}

/**
 * La clínica SOLICITA una franja de disponibilidad de un técnico. El hueco pasa
 * a "pending" (bloqueado para otras clínicas) y se avisa al técnico para que la
 * confirme o rechace. La reserva no es firme hasta que el técnico acepta. Los
 * admins solo supervisan.
 */
export async function bookSlotAction(slotId: string): Promise<ActionResult> {
  const clinic = await requireRole("clinic");
  if (clinic.profile.role === "admin") {
    return { error: "admin_supervises" };
  }

  const slot = await getAvailabilitySlotById(slotId);
  if (!slot) return { error: "slot_gone" };
  if (slot.status !== "open") return { error: "slot_not_open" };

  // Transición atómica open → pending: si otra clínica se adelantó, falla aquí.
  const ok = await requestSlot(slotId, clinic.profile.id);
  if (!ok) return { error: "slot_taken" };

  const pro = await getUserProfileById(slot.professionalId);
  if (pro) {
    const horario = timeOf(slot);
    await notify({
      userId: pro.id,
      type: "slot_requested",
      title: "Nueva solicitud de reserva",
      body: `${clinic.profile.fullName} quiere reservar tu disponibilidad del ${formatDateEs(slot.date)}${horario}. Acéptala o recházala desde tu calendario.`,
      link: PRO_CAL,
      email: {
        to: pro.email,
        subject: "Una clínica quiere reservar tu disponibilidad",
        html: renderEmail({
          heading: "Tienes una solicitud de reserva",
          intro: `${clinic.profile.fullName} quiere reservar tu disponibilidad. Confírmala o recházala desde tu calendario.`,
          lines: [`📅 ${formatDateEs(slot.date)}${horario}`],
          ctaText: "Ver mi calendario",
          ctaPath: PRO_CAL,
        }),
      },
    });
  }

  revalidatePath(CLINIC_CAL);
  revalidatePath(PRO_CAL);
  return { ok: true };
}

/** El técnico ACEPTA una solicitud de reserva: pasa a confirmada. Avisa a la clínica. */
export async function acceptBookingAction(slotId: string): Promise<ActionResult> {
  const pro = await requireRole("professional");
  if (pro.profile.role === "admin") return { error: "admin_supervises" };

  const slot = await getAvailabilitySlotById(slotId);
  if (!slot) return { error: "slot_gone" };
  if (notOwner(slot.professionalId, pro.profile.id)) return { error: "not_owner" };
  if (slot.status !== "pending") return { error: "slot_not_pending" };

  const ok = await acceptBooking(slotId, pro.profile.id);
  if (!ok) return { error: "action_failed" };

  if (slot.bookedByClinicId) {
    const clinic = await getUserProfileById(slot.bookedByClinicId);
    if (clinic) {
      const horario = timeOf(slot);
      await notify({
        userId: clinic.id,
        type: "booking_confirmed",
        title: "Reserva confirmada",
        body: `${pro.profile.fullName} ha confirmado tu reserva del ${formatDateEs(slot.date)}${horario}.`,
        link: CLINIC_CAL,
        email: {
          to: clinic.email,
          subject: "Tu reserva ha sido confirmada",
          html: renderEmail({
            heading: "Reserva confirmada",
            intro: `${pro.profile.fullName} ha confirmado la disponibilidad que reservaste.`,
            lines: [`📅 ${formatDateEs(slot.date)}${horario}`],
            ctaText: "Ver mis reservas",
            ctaPath: CLINIC_CAL,
          }),
        },
      });
    }
  }

  revalidatePath(PRO_CAL);
  revalidatePath(CLINIC_CAL);
  return { ok: true };
}

/**
 * El técnico RECHAZA una solicitud de reserva: el hueco se libera y la clínica
 * recibe el aviso CON el motivo. Pedimos motivo a propósito: si un técnico
 * publica disponibilidad y luego rechaza una solicitud, la clínica merece saber
 * por qué (cortesía, no penalización: rechazar una solicitud no es romper un
 * compromiso confirmado).
 */
export async function rejectBookingAction(slotId: string, reason?: string): Promise<ActionResult> {
  const pro = await requireRole("professional");
  if (pro.profile.role === "admin") return { error: "admin_supervises" };

  const slot = await getAvailabilitySlotById(slotId);
  if (!slot) return { error: "slot_gone" };
  if (notOwner(slot.professionalId, pro.profile.id)) return { error: "not_owner" };
  if (slot.status !== "pending") return { error: "slot_not_pending" };

  const cleanReason = reason?.trim();
  if (!cleanReason) return { error: "reason_required" };

  const clinicId = slot.bookedByClinicId;
  const ok = await rejectBooking(slotId, pro.profile.id);
  if (!ok) return { error: "action_failed" };

  if (clinicId) {
    const clinic = await getUserProfileById(clinicId);
    if (clinic) {
      await notify({
        userId: clinic.id,
        type: "booking_declined",
        title: "Reserva rechazada",
        body: `${pro.profile.fullName} no puede atender tu reserva del ${formatDateEs(slot.date)}. Motivo: ${cleanReason}. El hueco vuelve a estar disponible para otras clínicas.`,
        link: CLINIC_CAL,
        email: {
          to: clinic.email,
          subject: "Una reserva no pudo confirmarse",
          html: renderEmail({
            heading: "Reserva no confirmada",
            intro: `${pro.profile.fullName} no puede atender la disponibilidad que reservaste. El hueco vuelve a estar libre.`,
            lines: [`📅 ${formatDateEs(slot.date)}`, `Motivo: ${cleanReason}`],
            ctaText: "Buscar otros técnicos",
            ctaPath: CLINIC_CAL,
          }),
        },
      });
    }
  }

  revalidatePath(PRO_CAL);
  revalidatePath(CLINIC_CAL);
  return { ok: true };
}
