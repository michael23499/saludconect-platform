"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../auth/guards";
import { getUserProfileById } from "../queries/users";
import { getSpecialtyBySlug } from "../queries/specialties";
import { listProfessionalRecipientsForSpecialty } from "../queries/professionals";
import {
  createSurgery,
  getSurgeryById,
  updateSurgeryStatus,
  updateSurgery,
  softDeleteSurgery,
} from "../queries/surgeries";
import type { Surgery, NotificationType } from "../db";
import {
  createApplication,
  getApplicationWithSurgery,
  getApplicationBySurgeryAndProfessional,
  updateApplicationStatus,
  countConfirmedForSurgery,
  listEngagedRecipientsForSurgery,
} from "../queries/applications";
import { notify, notifyMany } from "../notifications/notify";
import { renderEmail } from "../notifications/email";
import { CAPILAR_SLUG } from "../db/seed-data";

const CLINIC_SURGERIES = "/dashboard/clinic/surgeries";
const PRO_SURGERIES = "/dashboard/professional/surgeries";

/** Formatea "2026-05-28" → "mar, 28 may". Mediodía para evitar saltos de día por tz. */
function formatDateEs(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

function parseIntOrNull(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export type CreateSurgeryState = { error: string } | null;

/**
 * La clínica publica una cirugía (el "ejemplo del martes"). Inserta la cirugía
 * y notifica a todos los técnicos de la especialidad (in-app + email). Solo
 * "Microinjerto capilar" por ahora — la especialidad se resuelve por slug.
 */
export async function createSurgeryAction(
  _prev: CreateSurgeryState,
  formData: FormData,
): Promise<CreateSurgeryState> {
  const clinic = await requireRole("clinic");
  const isAdmin = clinic.profile.role === "admin";

  // La clínica dueña de la cirugía: la propia (rol clinic) o la que elige el
  // admin al publicar en su nombre (soporte). El admin DEBE indicar una.
  let clinicId = clinic.profile.id;
  let clinicName = clinic.profile.fullName;
  let clinicCity = clinic.profile.city;
  if (isAdmin) {
    const chosen = formData.get("clinicId");
    if (typeof chosen !== "string" || !chosen) {
      return { error: "Como administrador, elige a nombre de qué clínica publicas la cirugía." };
    }
    const clinicUser = await getUserProfileById(chosen);
    if (!clinicUser || clinicUser.role !== "clinic") {
      return { error: "La clínica seleccionada no es válida." };
    }
    clinicId = clinicUser.id;
    clinicName = clinicUser.fullName;
    clinicCity = clinicUser.city;
  }

  const specialty = await getSpecialtyBySlug(CAPILAR_SLUG);
  if (!specialty) {
    return {
      error: "La especialidad aún no está disponible. Contacta con soporte (falta sembrar el catálogo).",
    };
  }

  const titleRaw = formData.get("title");
  const title =
    typeof titleRaw === "string" && titleRaw.trim() ? titleRaw.trim() : "Microinjerto capilar";

  const date = formData.get("date");
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Indica una fecha válida para la cirugía." };
  }
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    return { error: "La fecha de la cirugía no puede ser anterior a hoy." };
  }

  const vacancies = parseIntOrNull(formData.get("vacancies")) ?? 1;
  if (vacancies < 1 || vacancies > 20) {
    return { error: "El número de técnicos debe estar entre 1 y 20." };
  }

  const startTime = (formData.get("startTime") as string) || null;
  const endTime = (formData.get("endTime") as string) || null;
  const city = ((formData.get("city") as string) || "").trim() || clinicCity || null;
  const address = ((formData.get("address") as string) || "").trim() || null;
  const ratePerHour = parseIntOrNull(formData.get("ratePerHour"));
  const urgent = formData.get("urgent") === "on" || formData.get("urgent") === "true";
  const description = ((formData.get("description") as string) || "").trim() || null;

  const surgery = await createSurgery({
    clinicId,
    specialtyId: specialty.id,
    title,
    description,
    date,
    startTime,
    endTime,
    city,
    address,
    vacancies,
    ratePerHour,
    urgent,
    status: "open",
  });

  // Avisar a los técnicos compatibles (misma especialidad, disponibles).
  const recipients = await listProfessionalRecipientsForSpecialty(specialty.id);
  const when = formatDateEs(date);
  const horario = startTime && endTime ? ` (${startTime}–${endTime})` : "";
  const zona = city ? ` en ${city}` : "";
  await notifyMany(
    recipients.map((r) => ({
      userId: r.id,
      type: "new_surgery" as const,
      title: `Nueva cirugía capilar${zona}`,
      body: `${clinicName} busca ${vacancies} ${vacancies === 1 ? "técnico" : "técnicos"} para el ${when}${horario}.`,
      link: `${PRO_SURGERIES}/${surgery.id}`,
      email: {
        to: r.email,
        subject: `Nueva oportunidad: cirugía capilar el ${when}`,
        html: renderEmail({
          heading: "Nueva cirugía disponible",
          intro: `Hola ${r.fullName.split(" ")[0]}, hay una nueva oportunidad que encaja con tu especialidad.`,
          lines: [
            `<b>${clinicName}</b> necesita <b>${vacancies}</b> ${vacancies === 1 ? "técnico" : "técnicos"}.`,
            `📅 ${when}${horario}${zona}`,
            ratePerHour ? `💶 ${ratePerHour} €/h orientativos` : "",
          ].filter(Boolean),
          ctaText: "Ver y postularme",
          ctaPath: PRO_SURGERIES,
        }),
      },
    })),
  );

  revalidatePath(CLINIC_SURGERIES);
  revalidatePath(PRO_SURGERIES);
  // Lleva a la clínica al detalle de la cirugía recién creada.
  redirect(`${CLINIC_SURGERIES}/${surgery.id}`);
}

export type ActionResult = { ok: true } | { error: string };

/** El técnico se postula a una cirugía. Avisa a la clínica. */
export async function applyToSurgeryAction(
  surgeryId: string,
  message?: string,
): Promise<ActionResult> {
  const pro = await requireRole("professional");
  if (pro.profile.role === "admin") {
    return { error: "Los administradores solo supervisan, no se postulan." };
  }

  const surgery = await getSurgeryById(surgeryId);
  if (!surgery) return { error: "La cirugía ya no existe." };
  if (surgery.status !== "open") return { error: "Esta cirugía ya no admite postulaciones." };

  // ¿Ya existía una postulación de este técnico a esta cirugía? Si la había
  // retirado (withdrawn), la reactivamos; si sigue activa o fue descartada, no.
  const existing = await getApplicationBySurgeryAndProfessional(surgeryId, pro.profile.id);
  if (existing) {
    if (existing.status === "applied" || existing.status === "confirmed") {
      return { error: "Ya te habías postulado a esta cirugía." };
    }
    if (existing.status === "rejected") {
      return { error: "La clínica ya descartó tu postulación a esta cirugía." };
    }
    // withdrawn → volver a postularse.
    await updateApplicationStatus(existing.id, "applied");
  } else {
    const application = await createApplication({
      surgeryId,
      professionalId: pro.profile.id,
      message: message?.trim() || null,
    });
    if (!application) return { error: "Ya te habías postulado a esta cirugía." };
  }

  // Avisar a la clínica.
  const clinic = await getUserProfileById(surgery.clinicId);
  if (clinic) {
    await notify({
      userId: clinic.id,
      type: "application_received",
      title: "Nuevo candidato para tu cirugía",
      body: `${pro.profile.fullName} se ha postulado a «${surgery.title}».`,
      link: `${CLINIC_SURGERIES}/${surgery.id}`,
      email: {
        to: clinic.email,
        subject: "Tienes un nuevo candidato",
        html: renderEmail({
          heading: "Nuevo candidato",
          intro: `${pro.profile.fullName} se ha postulado a tu cirugía «${surgery.title}».`,
          ctaText: "Ver candidatos",
          ctaPath: `${CLINIC_SURGERIES}/${surgery.id}`,
        }),
      },
    });
  }

  revalidatePath(PRO_SURGERIES);
  revalidatePath(`${CLINIC_SURGERIES}/${surgery.id}`);
  return { ok: true };
}

/** El técnico retira su postulación. */
export async function withdrawApplicationAction(applicationId: string): Promise<ActionResult> {
  const pro = await requireRole("professional");
  if (pro.profile.role === "admin") return { error: "Los administradores solo supervisan." };
  const row = await getApplicationWithSurgery(applicationId);
  if (!row) return { error: "La postulación ya no existe." };
  if (row.application.professionalId !== pro.profile.id) {
    return { error: "No puedes modificar esta postulación." };
  }
  await updateApplicationStatus(applicationId, "withdrawn");
  revalidatePath(PRO_SURGERIES);
  revalidatePath(`${CLINIC_SURGERIES}/${row.surgery.id}`);
  return { ok: true };
}

/** La clínica confirma a un candidato (le da la plaza). */
export async function confirmApplicationAction(applicationId: string): Promise<ActionResult> {
  const clinic = await requireRole("clinic");
  const isAdmin = clinic.profile.role === "admin";
  const row = await getApplicationWithSurgery(applicationId);
  if (!row) return { error: "La postulación ya no existe." };
  // Propiedad: la clínica dueña de la cirugía, o un admin (intervención de soporte).
  if (!isAdmin && row.surgery.clinicId !== clinic.profile.id) {
    return { error: "Esta cirugía no es tuya." };
  }
  if (row.application.status === "confirmed") return { ok: true };

  const confirmed = await countConfirmedForSurgery(row.surgery.id);
  if (confirmed >= row.surgery.vacancies) {
    return { error: "Ya has cubierto todas las plazas de esta cirugía." };
  }

  await updateApplicationStatus(applicationId, "confirmed");

  // ¿Se cubrieron todas las vacantes? → marcar la cirugía como cubierta.
  const nowConfirmed = confirmed + 1;
  if (nowConfirmed >= row.surgery.vacancies) {
    await updateSurgeryStatus(row.surgery.id, "filled");
  }

  // Avisar al técnico confirmado.
  const pro = await getUserProfileById(row.application.professionalId);
  if (pro) {
    await notify({
      userId: pro.id,
      type: "application_confirmed",
      title: "¡Plaza confirmada!",
      body: `Te han confirmado para «${row.surgery.title}» el ${formatDateEs(row.surgery.date)}.`,
      link: `${PRO_SURGERIES}/${row.surgery.id}`,
      email: {
        to: pro.email,
        subject: "Te han confirmado una cirugía",
        html: renderEmail({
          heading: "¡Plaza confirmada!",
          intro: `Te han confirmado para «${row.surgery.title}».`,
          lines: [`📅 ${formatDateEs(row.surgery.date)}`],
          ctaText: "Ver la cirugía",
          ctaPath: `${PRO_SURGERIES}/${row.surgery.id}`,
        }),
      },
    });
  }

  revalidatePath(`${CLINIC_SURGERIES}/${row.surgery.id}`);
  revalidatePath(PRO_SURGERIES);
  return { ok: true };
}

/** La clínica descarta a un candidato. */
export async function rejectApplicationAction(applicationId: string): Promise<ActionResult> {
  const clinic = await requireRole("clinic");
  const isAdmin = clinic.profile.role === "admin";
  const row = await getApplicationWithSurgery(applicationId);
  if (!row) return { error: "La postulación ya no existe." };
  if (!isAdmin && row.surgery.clinicId !== clinic.profile.id) {
    return { error: "Esta cirugía no es tuya." };
  }
  await updateApplicationStatus(applicationId, "rejected");

  const pro = await getUserProfileById(row.application.professionalId);
  if (pro) {
    await notify({
      userId: pro.id,
      type: "application_rejected",
      title: "Postulación no seleccionada",
      body: `Esta vez no has sido seleccionado para «${row.surgery.title}». ¡Hay más oportunidades!`,
      link: `${PRO_SURGERIES}/${row.surgery.id}`,
    });
  }

  revalidatePath(`${CLINIC_SURGERIES}/${row.surgery.id}`);
  revalidatePath(PRO_SURGERIES);
  return { ok: true };
}

export type UpdateSurgeryInput = {
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  city: string | null;
  address: string | null;
  vacancies: number;
  ratePerHour: number | null;
  urgent: boolean;
  status: Surgery["status"];
  description: string | null;
};

/**
 * Edita una cirugía. Pueden hacerlo la clínica DUEÑA o un ADMIN (intervención
 * de soporte: corregir dirección, fecha, etc.). Verifica propiedad salvo admin.
 */
export async function updateSurgeryAction(
  surgeryId: string,
  data: UpdateSurgeryInput,
): Promise<ActionResult> {
  const clinic = await requireRole("clinic");
  const isAdmin = clinic.profile.role === "admin";

  const surgery = await getSurgeryById(surgeryId);
  if (!surgery) return { error: "La cirugía ya no existe." };
  if (!isAdmin && surgery.clinicId !== clinic.profile.id) {
    return { error: "Esta cirugía no es tuya." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) return { error: "Indica una fecha válida." };
  if (data.vacancies < 1 || data.vacancies > 20) {
    return { error: "El número de técnicos debe estar entre 1 y 20." };
  }

  const newStart = data.startTime || null;
  const newEnd = data.endTime || null;
  const newCity = data.city?.trim() || null;
  const newAddress = data.address?.trim() || null;
  const newRate = data.ratePerHour ?? null;

  await updateSurgery(surgeryId, {
    title: data.title.trim() || "Microinjerto capilar",
    description: data.description?.trim() || null,
    date: data.date,
    startTime: newStart,
    endTime: newEnd,
    city: newCity,
    address: newAddress,
    vacancies: data.vacancies,
    ratePerHour: data.ratePerHour,
    urgent: data.urgent,
    status: data.status,
  });

  // Avisar a los técnicos inscritos (postulados/confirmados) si cambian datos
  // que les afectan: fecha, horario, ubicación, tarifa o una cancelación.
  const cancelled = data.status === "cancelled" && surgery.status !== "cancelled";
  const changes: string[] = [];
  if (surgery.date !== data.date) changes.push(`nueva fecha: ${formatDateEs(data.date)}`);
  if (surgery.startTime !== newStart || surgery.endTime !== newEnd) {
    changes.push(newStart && newEnd ? `nuevo horario: ${newStart}–${newEnd}` : "horario actualizado");
  }
  if (surgery.address !== newAddress || surgery.city !== newCity) {
    const loc = [newAddress, newCity].filter(Boolean).join(", ");
    changes.push(loc ? `nueva ubicación: ${loc}` : "ubicación actualizada");
  }
  if ((surgery.ratePerHour ?? null) !== newRate) {
    changes.push(newRate ? `nueva tarifa: ${newRate} €/h` : "tarifa actualizada");
  }

  if (cancelled || changes.length > 0) {
    const engaged = await listEngagedRecipientsForSurgery(surgeryId);
    const surgeryTitle = data.title.trim() || surgery.title;
    const updType: NotificationType = cancelled ? "surgery_cancelled" : "surgery_updated";
    if (engaged.length > 0) {
      await notifyMany(
        engaged.map((r) => ({
          userId: r.id,
          type: updType,
          title: cancelled ? "Cirugía cancelada" : "Cambios en una cirugía",
          body: cancelled
            ? `La cirugía «${surgeryTitle}» del ${formatDateEs(data.date)} ha sido cancelada por la clínica.`
            : `La clínica ha actualizado «${surgeryTitle}»: ${changes.join("; ")}.`,
          link: `${PRO_SURGERIES}/${surgeryId}`,
          email: {
            to: r.email,
            subject: cancelled
              ? "Una cirugía a la que estás inscrito ha sido cancelada"
              : "Cambios en una cirugía a la que estás inscrito",
            html: renderEmail({
              heading: cancelled ? "Cirugía cancelada" : "Cambios en la cirugía",
              intro: `Hola ${r.fullName.split(" ")[0]},`,
              lines: cancelled
                ? [`La cirugía «${surgeryTitle}» del ${formatDateEs(data.date)} ha sido cancelada.`]
                : [`«${surgeryTitle}» ha cambiado:`, ...changes.map((c) => `• ${c}`)],
              ctaText: "Ver la cirugía",
              ctaPath: `${PRO_SURGERIES}/${surgeryId}`,
            }),
          },
        })),
      );
    }
  }

  revalidatePath(`${CLINIC_SURGERIES}/${surgeryId}`);
  revalidatePath(CLINIC_SURGERIES);
  revalidatePath(PRO_SURGERIES);
  return { ok: true };
}

/**
 * La clínica INVITA a un técnico (desde el directorio) a una de sus cirugías
 * abiertas. Crea una postulación marcada como `invitedByClinic` y avisa al
 * técnico. El admin no invita (no tiene clínica). Reutiliza el flujo: luego la
 * clínica confirma como con cualquier candidato.
 */
export async function inviteToSurgeryAction(
  surgeryId: string,
  professionalId: string,
): Promise<ActionResult> {
  const clinic = await requireRole("clinic");
  if (clinic.profile.role === "admin") {
    return { error: "Los administradores no invitan; usa una cuenta de clínica." };
  }

  const surgery = await getSurgeryById(surgeryId);
  if (!surgery) return { error: "La cirugía ya no existe." };
  if (surgery.clinicId !== clinic.profile.id) return { error: "Esta cirugía no es tuya." };
  if (surgery.status !== "open") return { error: "Esta cirugía ya no admite inscripciones." };

  const existing = await getApplicationBySurgeryAndProfessional(surgeryId, professionalId);
  if (existing) {
    if (existing.status === "applied" || existing.status === "confirmed") {
      return { error: "Este técnico ya está inscrito en esta cirugía." };
    }
    // withdrawn/rejected → reactivar como activo de nuevo.
    await updateApplicationStatus(existing.id, "applied");
  } else {
    await createApplication({ surgeryId, professionalId, invitedByClinic: true });
  }

  const pro = await getUserProfileById(professionalId);
  if (pro) {
    await notify({
      userId: pro.id,
      type: "surgery_invitation",
      title: "Te han invitado a una cirugía",
      body: `${clinic.profile.fullName} te ha invitado a «${surgery.title}» el ${formatDateEs(surgery.date)}.`,
      link: `${PRO_SURGERIES}/${surgeryId}`,
      email: {
        to: pro.email,
        subject: "Una clínica te ha invitado a una cirugía",
        html: renderEmail({
          heading: "Te han invitado a una cirugía",
          intro: `${clinic.profile.fullName} te ha invitado a participar en una cirugía.`,
          lines: [`«${surgery.title}»`, `📅 ${formatDateEs(surgery.date)}`],
          ctaText: "Ver la invitación",
          ctaPath: `${PRO_SURGERIES}/${surgeryId}`,
        }),
      },
    });
  }

  revalidatePath(`${CLINIC_SURGERIES}/${surgeryId}`);
  revalidatePath(PRO_SURGERIES);
  return { ok: true };
}

/**
 * "Elimina" una cirugía sin borrarla: soft-delete (la oculta de los listados,
 * reversible en BD). Pueden hacerlo la clínica DUEÑA o un ADMIN (soporte). Avisa
 * a los técnicos inscritos de que la cirugía fue retirada.
 */
export async function deleteSurgeryAction(surgeryId: string): Promise<ActionResult> {
  const clinic = await requireRole("clinic");
  const isAdmin = clinic.profile.role === "admin";

  const surgery = await getSurgeryById(surgeryId);
  if (!surgery) return { error: "La cirugía ya no existe." };
  if (!isAdmin && surgery.clinicId !== clinic.profile.id) {
    return { error: "Esta cirugía no es tuya." };
  }

  const engaged = await listEngagedRecipientsForSurgery(surgeryId);
  await softDeleteSurgery(surgeryId);

  if (engaged.length > 0) {
    await notifyMany(
      engaged.map((r) => ({
        userId: r.id,
        type: "surgery_cancelled" as const,
        title: "Cirugía retirada",
        body: `La cirugía «${surgery.title}» del ${formatDateEs(surgery.date)} ha sido retirada.`,
        link: PRO_SURGERIES,
        email: {
          to: r.email,
          subject: "Una cirugía a la que estabas inscrito se ha retirado",
          html: renderEmail({
            heading: "Cirugía retirada",
            intro: `Hola ${r.fullName.split(" ")[0]},`,
            lines: [`La cirugía «${surgery.title}» del ${formatDateEs(surgery.date)} ya no está disponible.`],
            ctaText: "Ver otras cirugías",
            ctaPath: PRO_SURGERIES,
          }),
        },
      })),
    );
  }

  revalidatePath(CLINIC_SURGERIES);
  revalidatePath(PRO_SURGERIES);
  return { ok: true };
}
