import { and, asc, eq, gte, inArray, getTableColumns } from "drizzle-orm";
import {
  db,
  availabilitySlots,
  users,
  professionals,
  specialties,
  type AvailabilitySlot,
  type NewAvailabilitySlot,
} from "../db";
import type { CancelledBy } from "../policy/reservation";

/** Fecha de hoy en formato YYYY-MM-DD para comparar con la columna `date`. */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function createAvailabilitySlot(
  data: NewAvailabilitySlot,
): Promise<AvailabilitySlot> {
  const rows = await db.insert(availabilitySlots).values(data).returning();
  return rows[0];
}

export async function getAvailabilitySlotById(id: string): Promise<AvailabilitySlot | null> {
  const rows = await db
    .select()
    .from(availabilitySlots)
    .where(eq(availabilitySlots.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** Slot del técnico + nombre de la clínica que lo solicitó/reservó (si aplica). */
export type ProfessionalSlot = AvailabilitySlot & { bookedByName: string | null };

/** Todas las franjas de un técnico (su propia gestión), por fecha ascendente.
 *  Incluye el nombre de la clínica para las franjas pendientes/reservadas. */
export async function listSlotsByProfessional(
  professionalId: string,
): Promise<ProfessionalSlot[]> {
  return db
    .select({
      ...getTableColumns(availabilitySlots),
      bookedByName: users.fullName,
    })
    .from(availabilitySlots)
    .leftJoin(users, eq(users.id, availabilitySlots.bookedByClinicId))
    .where(eq(availabilitySlots.professionalId, professionalId))
    .orderBy(asc(availabilitySlots.date));
}

/** Franjas abiertas y futuras de UN técnico (para su ficha pública). */
export async function listOpenSlotsByProfessional(
  professionalId: string,
): Promise<AvailabilitySlot[]> {
  return db
    .select()
    .from(availabilitySlots)
    .where(
      and(
        eq(availabilitySlots.professionalId, professionalId),
        eq(availabilitySlots.status, "open"),
        gte(availabilitySlots.date, todayStr()),
      ),
    )
    .orderBy(asc(availabilitySlots.date));
}

export type SlotWithProfessional = {
  slot: AvailabilitySlot;
  proName: string;
  proCity: string | null;
  proAvatarUrl: string | null;
  proVerified: boolean;
};

/**
 * Franjas abiertas y futuras de técnicos, para que la clínica las reserve.
 * Filtra por especialidad si se indica (capilar en v1).
 */
export async function listOpenSlots(specialtyId?: string): Promise<SlotWithProfessional[]> {
  const conds = [
    eq(availabilitySlots.status, "open"),
    gte(availabilitySlots.date, todayStr()),
  ];
  if (specialtyId) conds.push(eq(availabilitySlots.specialtyId, specialtyId));
  return db
    .select({
      slot: availabilitySlots,
      proName: users.fullName,
      proCity: users.city,
      proAvatarUrl: users.avatarUrl,
      proVerified: users.verified,
    })
    .from(availabilitySlots)
    .innerJoin(users, eq(users.id, availabilitySlots.professionalId))
    .where(and(...conds))
    .orderBy(asc(availabilitySlots.date));
}

/** Slot reservado + ficha del profesional (para abrir su modal desde la reserva). */
export type BookedSlotDetail = SlotWithProfessional & {
  proType: "doctor" | "technician" | null;
  specialtyName: string | null;
  headline: string | null;
  bio: string | null;
  yearsExperience: number | null;
  hourlyRate: number | null;
};

/** Franjas que una clínica solicitó (pendientes de confirmar) o ya tiene
 *  confirmadas, para su vista de reservas directas. Incluye la ficha del
 *  profesional para mostrarla en un modal al pulsar la reserva. */
export async function listSlotsBookedByClinic(
  clinicId: string,
): Promise<BookedSlotDetail[]> {
  return db
    .select({
      slot: availabilitySlots,
      proName: users.fullName,
      proCity: users.city,
      proAvatarUrl: users.avatarUrl,
      proVerified: users.verified,
      proType: professionals.proType,
      specialtyName: specialties.name,
      headline: professionals.headline,
      bio: professionals.bio,
      yearsExperience: professionals.yearsExperience,
      hourlyRate: professionals.hourlyRate,
    })
    .from(availabilitySlots)
    .innerJoin(users, eq(users.id, availabilitySlots.professionalId))
    .leftJoin(professionals, eq(professionals.id, availabilitySlots.professionalId))
    .leftJoin(specialties, eq(specialties.id, professionals.specialtyId))
    .where(
      and(
        eq(availabilitySlots.bookedByClinicId, clinicId),
        inArray(availabilitySlots.status, ["pending", "booked"]),
      ),
    )
    .orderBy(asc(availabilitySlots.date));
}

/**
 * Solicitud de reserva de la clínica: el hueco pasa de "open" a "pending"
 * (bloqueado para otras clínicas) esperando que el técnico confirme. Atómico:
 * el UPDATE solo prospera si seguía "open", evitando que dos clínicas reserven
 * el mismo hueco a la vez. Devuelve true si la reserva se registró.
 */
export async function requestSlot(id: string, clinicId: string): Promise<boolean> {
  const rows = await db
    .update(availabilitySlots)
    .set({
      status: "pending",
      bookedByClinicId: clinicId,
      bookedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(availabilitySlots.id, id), eq(availabilitySlots.status, "open")))
    .returning({ id: availabilitySlots.id });
  return rows.length > 0;
}

/** El técnico ACEPTA la solicitud: pending → booked. Atómico (solo si seguía
 *  pendiente y es suyo). Devuelve true si se confirmó. */
export async function acceptBooking(id: string, professionalId: string): Promise<boolean> {
  const rows = await db
    .update(availabilitySlots)
    .set({ status: "booked", updatedAt: new Date() })
    .where(
      and(
        eq(availabilitySlots.id, id),
        eq(availabilitySlots.professionalId, professionalId),
        eq(availabilitySlots.status, "pending"),
      ),
    )
    .returning({ id: availabilitySlots.id });
  return rows.length > 0;
}

/** El técnico RECHAZA la solicitud: pending → open de nuevo (se libera el hueco
 *  y se desvincula la clínica). Atómico. Devuelve true si se liberó. */
export async function rejectBooking(id: string, professionalId: string): Promise<boolean> {
  const rows = await db
    .update(availabilitySlots)
    .set({ status: "open", bookedByClinicId: null, bookedAt: null, updatedAt: new Date() })
    .where(
      and(
        eq(availabilitySlots.id, id),
        eq(availabilitySlots.professionalId, professionalId),
        eq(availabilitySlots.status, "pending"),
      ),
    )
    .returning({ id: availabilitySlots.id });
  return rows.length > 0;
}

/**
 * El técnico retira una franja (o se cancela una reserva). Si la franja estaba
 * reservada en firme, `opts` deja constancia de quién canceló y por qué (para la
 * fiabilidad). Retirar una franja libre no penaliza, así que `opts` es opcional.
 */
export async function cancelSlot(
  id: string,
  opts?: { cancelledBy?: CancelledBy; reason?: string | null },
): Promise<void> {
  await db
    .update(availabilitySlots)
    .set({
      status: "cancelled",
      cancelledBy: opts?.cancelledBy ?? null,
      cancelledAt: opts?.cancelledBy ? new Date() : null,
      cancelReason: opts?.reason ?? null,
      updatedAt: new Date(),
    })
    .where(eq(availabilitySlots.id, id));
}
