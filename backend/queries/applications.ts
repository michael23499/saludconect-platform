import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import {
  db,
  applications,
  surgeries,
  users,
  professionals,
  type Application,
  type NewApplication,
  type Surgery,
} from "../db";

/**
 * Crea una postulación. Devuelve null si el técnico ya se había postulado a esa
 * cirugía (choca con el unique surgery+professional → onConflictDoNothing).
 */
export async function createApplication(data: NewApplication): Promise<Application | null> {
  const rows = await db
    .insert(applications)
    .values(data)
    .onConflictDoNothing({ target: [applications.surgeryId, applications.professionalId] })
    .returning();
  return rows[0] ?? null;
}

/** Postulación de un técnico a una cirugía concreta (o null), para re-postular. */
export async function getApplicationBySurgeryAndProfessional(
  surgeryId: string,
  professionalId: string,
): Promise<Application | null> {
  const rows = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.surgeryId, surgeryId),
        eq(applications.professionalId, professionalId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export type ApplicationWithSurgery = { application: Application; surgery: Surgery };

/** Postulación + su cirugía, para verificar propiedad antes de confirmar/rechazar. */
export async function getApplicationWithSurgery(
  applicationId: string,
): Promise<ApplicationWithSurgery | null> {
  const rows = await db
    .select({ application: applications, surgery: surgeries })
    .from(applications)
    .innerJoin(surgeries, eq(surgeries.id, applications.surgeryId))
    .where(eq(applications.id, applicationId))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateApplicationStatus(
  id: string,
  status: Application["status"],
): Promise<void> {
  await db
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(eq(applications.id, id));
}

export async function countConfirmedForSurgery(surgeryId: string): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(applications)
    .where(and(eq(applications.surgeryId, surgeryId), eq(applications.status, "confirmed")));
  return rows[0]?.n ?? 0;
}

export type ApplicantForSurgery = {
  application: Application;
  proName: string;
  proCity: string | null;
  proAvatarUrl: string | null;
  proVerified: boolean;
  headline: string | null;
  yearsExperience: number | null;
};

/** Candidatos (técnicos postulados) a una cirugía, para el panel de la clínica. */
export async function listApplicantsForSurgery(
  surgeryId: string,
): Promise<ApplicantForSurgery[]> {
  return db
    .select({
      application: applications,
      proName: users.fullName,
      proCity: users.city,
      proAvatarUrl: users.avatarUrl,
      proVerified: users.verified,
      headline: professionals.headline,
      yearsExperience: professionals.yearsExperience,
    })
    .from(applications)
    .innerJoin(users, eq(users.id, applications.professionalId))
    .leftJoin(professionals, eq(professionals.id, applications.professionalId))
    .where(eq(applications.surgeryId, surgeryId))
    .orderBy(desc(applications.createdAt));
}

export type EngagedRecipient = {
  id: string;
  email: string;
  fullName: string;
  status: Application["status"];
};

/**
 * Técnicos "inscritos" en una cirugía (postulados o confirmados), con email y
 * nombre, para avisarles cuando la clínica edita o retira la cirugía. Excluye a
 * los que se retiraron o fueron descartados.
 */
export async function listEngagedRecipientsForSurgery(
  surgeryId: string,
): Promise<EngagedRecipient[]> {
  return db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      status: applications.status,
    })
    .from(applications)
    .innerJoin(users, eq(users.id, applications.professionalId))
    .where(
      and(
        eq(applications.surgeryId, surgeryId),
        inArray(applications.status, ["applied", "confirmed"]),
      ),
    );
}

export type ProfessionalApplication = {
  application: Application;
  surgery: Surgery;
  clinicName: string;
};

/** Todas las postulaciones de un técnico (con su cirugía y clínica). */
export async function listApplicationsByProfessional(
  professionalId: string,
): Promise<ProfessionalApplication[]> {
  return db
    .select({ application: applications, surgery: surgeries, clinicName: users.fullName })
    .from(applications)
    .innerJoin(surgeries, eq(surgeries.id, applications.surgeryId))
    .innerJoin(users, eq(users.id, surgeries.clinicId))
    .where(eq(applications.professionalId, professionalId))
    .orderBy(desc(applications.createdAt));
}

/** Próximas cirugías confirmadas de un técnico (futuras), para su agenda. */
export async function listConfirmedUpcomingForProfessional(
  professionalId: string,
): Promise<ProfessionalApplication[]> {
  return db
    .select({ application: applications, surgery: surgeries, clinicName: users.fullName })
    .from(applications)
    .innerJoin(surgeries, eq(surgeries.id, applications.surgeryId))
    .innerJoin(users, eq(users.id, surgeries.clinicId))
    .where(
      and(
        eq(applications.professionalId, professionalId),
        eq(applications.status, "confirmed"),
        gte(surgeries.date, new Date().toISOString().slice(0, 10)),
      ),
    )
    .orderBy(asc(surgeries.date));
}
