import { and, asc, eq, gte } from "drizzle-orm";
import {
  db,
  availabilitySlots,
  users,
  type AvailabilitySlot,
  type NewAvailabilitySlot,
} from "../db";

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

/** Todas las franjas de un técnico (su propia gestión), por fecha ascendente. */
export async function listSlotsByProfessional(
  professionalId: string,
): Promise<AvailabilitySlot[]> {
  return db
    .select()
    .from(availabilitySlots)
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

/** Franjas que una clínica ya reservó (para su vista de reservas directas). */
export async function listSlotsBookedByClinic(
  clinicId: string,
): Promise<SlotWithProfessional[]> {
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
    .where(
      and(
        eq(availabilitySlots.bookedByClinicId, clinicId),
        eq(availabilitySlots.status, "booked"),
      ),
    )
    .orderBy(asc(availabilitySlots.date));
}

/** Reserva directa de la clínica: el hueco pasa a "booked". */
export async function bookSlot(id: string, clinicId: string): Promise<void> {
  await db
    .update(availabilitySlots)
    .set({
      status: "booked",
      bookedByClinicId: clinicId,
      bookedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(availabilitySlots.id, id));
}

/** El técnico retira una franja (o se cancela una reserva). */
export async function cancelSlot(id: string): Promise<void> {
  await db
    .update(availabilitySlots)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(availabilitySlots.id, id));
}
