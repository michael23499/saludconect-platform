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

const PRO_CAL = "/dashboard/professional/calendar";
const CLINIC_CAL = "/dashboard/clinic/calendar";

/** Formatea "2026-05-28" → "mar, 28 may". Mediodía para evitar saltos de día por tz. */
function formatDateEs(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" }).format(d);
}

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
    return { error: "Los administradores solo supervisan. Usa una cuenta de profesional." };
  }

  // Una o varias fechas (CSV): el cliente las calcula (día único o rango con
  // días de la semana). Aceptamos también `date` por compatibilidad.
  const raw = ((formData.get("dates") as string) || (formData.get("date") as string) || "").trim();
  const dates = Array.from(new Set(raw.split(",").map((s) => s.trim()).filter(Boolean)));
  if (dates.length === 0) return { error: "Indica al menos una fecha." };
  if (dates.length > 90) return { error: "Demasiadas fechas; reduce el rango." };

  const today = new Date().toISOString().slice(0, 10);
  for (const d of dates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return { error: "Hay una fecha no válida." };
    if (d < today) return { error: "Las fechas no pueden ser anteriores a hoy." };
  }

  const startTime = (formData.get("startTime") as string) || null;
  const endTime = (formData.get("endTime") as string) || null;
  if (startTime && endTime && endTime <= startTime) {
    return { error: "La hora de fin debe ser posterior a la de inicio." };
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

/** El técnico retira una franja. Si estaba reservada, avisa a la clínica. */
export async function cancelAvailabilityAction(slotId: string): Promise<ActionResult> {
  const pro = await requireRole("professional");
  if (pro.profile.role === "admin") return { error: "Los administradores solo supervisan." };

  const slot = await getAvailabilitySlotById(slotId);
  if (!slot) return { error: "Esta disponibilidad ya no existe." };
  if (slot.professionalId !== pro.profile.id) {
    return { error: "Esta disponibilidad no es tuya." };
  }
  if (slot.status === "cancelled") return { ok: true };

  await cancelSlot(slotId);

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
  return slot.startTime && slot.endTime ? ` (${slot.startTime}–${slot.endTime})` : "";
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
    return { error: "Los administradores solo supervisan, no reservan." };
  }

  const slot = await getAvailabilitySlotById(slotId);
  if (!slot) return { error: "Esta disponibilidad ya no existe." };
  if (slot.status !== "open") return { error: "Esta disponibilidad ya no está libre." };

  // Transición atómica open → pending: si otra clínica se adelantó, falla aquí.
  const ok = await requestSlot(slotId, clinic.profile.id);
  if (!ok) return { error: "Otra clínica acaba de reservar este hueco. Prueba con otra fecha." };

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
  if (pro.profile.role === "admin") return { error: "Los administradores solo supervisan." };

  const slot = await getAvailabilitySlotById(slotId);
  if (!slot) return { error: "Esta solicitud ya no existe." };
  if (slot.professionalId !== pro.profile.id) return { error: "Esta solicitud no es tuya." };
  if (slot.status !== "pending") return { error: "Esta solicitud ya no está pendiente." };

  const ok = await acceptBooking(slotId, pro.profile.id);
  if (!ok) return { error: "No se pudo confirmar; quizá la solicitud cambió de estado." };

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

/** El técnico RECHAZA una solicitud: el hueco se libera. Avisa a la clínica. */
export async function rejectBookingAction(slotId: string): Promise<ActionResult> {
  const pro = await requireRole("professional");
  if (pro.profile.role === "admin") return { error: "Los administradores solo supervisan." };

  const slot = await getAvailabilitySlotById(slotId);
  if (!slot) return { error: "Esta solicitud ya no existe." };
  if (slot.professionalId !== pro.profile.id) return { error: "Esta solicitud no es tuya." };
  if (slot.status !== "pending") return { error: "Esta solicitud ya no está pendiente." };

  const clinicId = slot.bookedByClinicId;
  const ok = await rejectBooking(slotId, pro.profile.id);
  if (!ok) return { error: "No se pudo rechazar; quizá la solicitud cambió de estado." };

  if (clinicId) {
    const clinic = await getUserProfileById(clinicId);
    if (clinic) {
      await notify({
        userId: clinic.id,
        type: "booking_declined",
        title: "Reserva rechazada",
        body: `${pro.profile.fullName} no puede atender tu reserva del ${formatDateEs(slot.date)}. El hueco vuelve a estar disponible para otras clínicas.`,
        link: CLINIC_CAL,
        email: {
          to: clinic.email,
          subject: "Una reserva no pudo confirmarse",
          html: renderEmail({
            heading: "Reserva no confirmada",
            intro: `${pro.profile.fullName} no puede atender la disponibilidad que reservaste. El hueco vuelve a estar libre.`,
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
