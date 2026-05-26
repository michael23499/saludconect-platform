import { and, asc, eq, ilike, type SQL } from "drizzle-orm";
import { db, professionals, users, specialties, type Professional, type NewProfessional } from "../db";

export async function getProfessionalById(id: string): Promise<Professional | null> {
  const rows = await db.select().from(professionals).where(eq(professionals.id, id)).limit(1);
  return rows[0] ?? null;
}

export type PublicProfessional = {
  id: string;
  fullName: string;
  city: string | null;
  avatarUrl: string | null;
  verified: boolean;
  headline: string | null;
  bio: string | null;
  yearsExperience: number | null;
  hourlyRate: number | null;
  availableForWork: boolean;
  specialtyName: string | null;
  proType: "doctor" | "technician";
};

const PUBLIC_PRO_COLUMNS = {
  id: professionals.id,
  fullName: users.fullName,
  city: users.city,
  avatarUrl: users.avatarUrl,
  verified: users.verified,
  headline: professionals.headline,
  bio: professionals.bio,
  yearsExperience: professionals.yearsExperience,
  hourlyRate: professionals.hourlyRate,
  availableForWork: professionals.availableForWork,
  specialtyName: specialties.name,
  proType: professionals.proType,
} as const;

export type PublicProfessionalFilters = {
  /** Búsqueda parcial por nombre. */
  search?: string;
  /** Solo técnicos disponibles para trabajar. */
  availableOnly?: boolean;
  specialtyId?: string;
};

/**
 * Profesionales para el directorio público: técnicos verificados y no
 * suspendidos, con su especialidad. La ficha completa / acciones de contacto
 * las controla la UI según haya o no sesión de clínica.
 */
export async function listPublicProfessionals(
  filters: PublicProfessionalFilters = {},
): Promise<PublicProfessional[]> {
  const conds: SQL[] = [
    eq(users.verified, true),
    eq(users.suspended, false),
    eq(users.isPublic, true),
  ];
  if (filters.search) conds.push(ilike(users.fullName, `%${filters.search}%`));
  if (filters.availableOnly) conds.push(eq(professionals.availableForWork, true));
  if (filters.specialtyId) conds.push(eq(professionals.specialtyId, filters.specialtyId));
  return db
    .select(PUBLIC_PRO_COLUMNS)
    .from(professionals)
    .innerJoin(users, eq(users.id, professionals.id))
    .leftJoin(specialties, eq(specialties.id, professionals.specialtyId))
    .where(and(...conds))
    .orderBy(asc(users.fullName));
}

/** Ficha de un profesional para su perfil público (o null si no es público). */
export async function getPublicProfessionalById(id: string): Promise<PublicProfessional | null> {
  const rows = await db
    .select(PUBLIC_PRO_COLUMNS)
    .from(professionals)
    .innerJoin(users, eq(users.id, professionals.id))
    .leftJoin(specialties, eq(specialties.id, professionals.specialtyId))
    .where(
      and(
        eq(professionals.id, id),
        eq(users.verified, true),
        eq(users.suspended, false),
        eq(users.isPublic, true),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Crea (o deja como está) la fila de profesional. Idempotente con
 * onConflictDoNothing: el onboarding puede reintentarse sin reventar.
 */
export async function createProfessional(data: NewProfessional): Promise<void> {
  await db.insert(professionals).values(data).onConflictDoNothing();
}

export async function updateProfessional(
  id: string,
  data: Partial<Omit<NewProfessional, "id">>,
): Promise<void> {
  await db
    .update(professionals)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(professionals.id, id));
}

export type NotifyRecipient = { id: string; email: string; fullName: string };

/**
 * Profesionales a notificar cuando se publica una cirugía: misma especialidad,
 * disponibles y no suspendidos. Si se indica `proType`, restringe al grupo
 * correcto (médicos o técnicos) para que cada cirugía avise solo a quien busca.
 */
export async function listProfessionalRecipientsForSpecialty(
  specialtyId: string,
  proType?: "doctor" | "technician",
): Promise<NotifyRecipient[]> {
  const conds = [
    eq(professionals.specialtyId, specialtyId),
    eq(professionals.availableForWork, true),
    eq(users.suspended, false),
  ];
  if (proType) conds.push(eq(professionals.proType, proType));
  return db
    .select({ id: professionals.id, email: users.email, fullName: users.fullName })
    .from(professionals)
    .innerJoin(users, eq(users.id, professionals.id))
    .where(and(...conds));
}
