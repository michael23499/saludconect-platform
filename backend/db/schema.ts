import {
  pgTable,
  pgSchema,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  doublePrecision,
  integer,
  date,
  unique,
} from "drizzle-orm/pg-core";

/**
 * Modelado mínimo del schema `auth` de Supabase (no lo gestionamos nosotros,
 * solo lo referenciamos para crear FKs con CASCADE). Drizzle Kit NO intenta
 * crear ni alterar nada dentro de este schema — Supabase es el dueño.
 */
const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const userRoleEnum = pgEnum("user_role", ["professional", "clinic", "admin"]);

export const users = pgTable("users", {
  // FK directa al auth.users.id de Supabase. Si se borra el user en Supabase
  // Auth (admin o self-delete), su perfil aquí desaparece también.
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull(),
  phone: text("phone"),
  city: text("city"),
  // Dirección completa (autocompletada con OpenStreetMap/Nominatim).
  address: text("address"),
  postalCode: text("postal_code"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  avatarUrl: text("avatar_url"),
  verified: boolean("verified").notNull().default(false),
  // Suspensión por admin: el usuario deja de poder operar pero se conserva su
  // dato (soft-delete reversible). NO es lo mismo que borrar de auth.users.
  suspended: boolean("suspended").notNull().default(false),
  // El profesional decide si aparece en el directorio público (/search). Solo
  // se listan los técnicos con isPublic=true. Default true (opt-out, no opt-in).
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ===========================================================================
// MARKETPLACE — motor de cirugías, vacantes y postulaciones
// ===========================================================================
// Modelo del dominio que conecta clínicas y profesionales. Arranca solo con
// "Microinjerto capilar" pero el catálogo de especialidades es data-driven
// (tabla, no enum) para añadir más sin migración. Flujo v1 (clínica→técnico):
// la clínica publica una `surgery` con N vacantes → es visible para técnicos
// de su especialidad → el técnico crea una `application` (se postula) → la
// clínica confirma/rechaza → al cubrir las vacantes la cirugía pasa a "filled".

/**
 * Catálogo de especialidades del marketplace. Data-driven a propósito: añadir
 * una nueva especialidad = una fila (sin migración ni deploy). Por ahora solo
 * se siembra y se expone "Microinjerto capilar" (slug `microinjerto-capilar`).
 */
export const specialties = pgTable("specialties", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  // Permite ocultar una especialidad sin borrarla (p.ej. aún no lanzada).
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Specialty = typeof specialties.$inferSelect;
export type NewSpecialty = typeof specialties.$inferInsert;

/**
 * Perfil extendido del profesional/técnico (1:1 con users de rol professional).
 * Vive aparte de `users` para no ensuciar la tabla base de auth y porque solo
 * aplica a un rol. Se crea al completar el perfil.
 */
export const professionals = pgTable("professionals", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  // Especialidad principal. Nullable durante el onboarding por si se completa
  // en dos pasos; en la práctica el form la exige (capilar).
  specialtyId: uuid("specialty_id").references(() => specialties.id),
  headline: text("headline"),
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  // Tarifa orientativa en €/h (entero). Opcional.
  hourlyRate: integer("hourly_rate"),
  // El técnico se declara disponible para recibir oportunidades.
  availableForWork: boolean("available_for_work").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Professional = typeof professionals.$inferSelect;
export type NewProfessional = typeof professionals.$inferInsert;

/**
 * Perfil extendido de la clínica (1:1 con users de rol clinic). Datos del
 * centro que los técnicos ven en las cirugías publicadas.
 */
export const clinics = pgTable("clinics", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  // Nombre comercial del centro (puede diferir del fullName del usuario).
  clinicName: text("clinic_name"),
  about: text("about"),
  website: text("website"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;

// open: publicada, admite postulaciones · filled: vacantes cubiertas
// cancelled: la clínica la retiró · completed: la cirugía ya ocurrió
export const surgeryStatusEnum = pgEnum("surgery_status", [
  "open",
  "filled",
  "cancelled",
  "completed",
]);

/**
 * La "cirugía" que publica la clínica: el ejemplo del cliente ("tengo una
 * cirugía capilar el martes, necesito 2 técnicos"). Es la oferta/necesidad con
 * fecha, ubicación y nº de vacantes. Visible para los técnicos de su especialidad.
 */
export const surgeries = pgTable("surgeries", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  specialtyId: uuid("specialty_id")
    .notNull()
    .references(() => specialties.id),
  title: text("title").notNull(),
  description: text("description"),
  // Fecha de la cirugía (sin hora). El horario va en start/end como texto "HH:MM".
  date: date("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  city: text("city"),
  address: text("address"),
  // Nº de técnicos que necesita la clínica = vacantes a cubrir.
  vacancies: integer("vacancies").notNull().default(1),
  // Tarifa orientativa en €/h (entero). Opcional.
  ratePerHour: integer("rate_per_hour"),
  urgent: boolean("urgent").notNull().default(false),
  status: surgeryStatusEnum("status").notNull().default("open"),
  // Soft-delete administrativo: si tiene fecha, la cirugía queda "eliminada"
  // (oculta de todos los listados) pero se conserva en BD. Es reversible
  // (restaurar = poner a null). El admin la usa para retirar cirugías sin
  // borrarlas; distinta de `cancelled`, que es una decisión visible de negocio.
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Surgery = typeof surgeries.$inferSelect;
export type NewSurgery = typeof surgeries.$inferInsert;

// applied: el técnico se postuló · confirmed: la clínica le dio la plaza
// rejected: la clínica lo descartó · withdrawn: el técnico retiró su postulación
export const applicationStatusEnum = pgEnum("application_status", [
  "applied",
  "confirmed",
  "rejected",
  "withdrawn",
]);

/**
 * Postulación de un técnico a una cirugía. Aquí vive el flujo "se postula → la
 * clínica confirma". Un técnico no puede postularse dos veces a la misma
 * cirugía (unique compuesto).
 */
export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    surgeryId: uuid("surgery_id")
      .notNull()
      .references(() => surgeries.id, { onDelete: "cascade" }),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: applicationStatusEnum("status").notNull().default("applied"),
    // true = la CLÍNICA invitó al técnico (camino inverso desde el directorio);
    // false = el técnico se postuló él mismo. Cambia el texto/origen en los paneles.
    invitedByClinic: boolean("invited_by_clinic").notNull().default(false),
    // Nota opcional del técnico al postularse.
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("applications_surgery_professional_uq").on(t.surgeryId, t.professionalId)],
);

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

// ===========================================================================
// FASE 2 — disponibilidad del profesional y reserva directa
// ===========================================================================
// El camino inverso del marketplace: el técnico publica los días/franjas en que
// está libre (availabilitySlots) y la clínica los ve y RESERVA directamente
// (sin proceso de postulación). Al reservar, el hueco pasa a "booked" y se avisa
// al técnico. Es el complemento de las cirugías de Fase 1.

// open: el técnico lo ofrece · booked: una clínica lo reservó
// cancelled: el técnico lo retiró (o la reserva se canceló)
export const availabilityStatusEnum = pgEnum("availability_status", [
  "open",
  "booked",
  "cancelled",
]);

/**
 * Franja de disponibilidad publicada por un técnico. Un día completo (sin
 * horas) o una franja (start/end como "HH:MM"). La clínica reserva el hueco
 * directamente; cuando lo hace, se rellenan bookedByClinicId/bookedAt y el
 * estado pasa a "booked".
 */
export const availabilitySlots = pgTable("availability_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  professionalId: uuid("professional_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Especialidad del técnico en el momento de publicar (para que la clínica
  // filtre por especialidad sin un join extra). Nullable por robustez.
  specialtyId: uuid("specialty_id").references(() => specialties.id),
  date: date("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  // Ciudad de España donde el técnico está disponible (opcional). La clínica la
  // ve al explorar la disponibilidad para saber dónde podría desplazarse.
  city: text("city"),
  note: text("note"),
  status: availabilityStatusEnum("status").notNull().default("open"),
  // Clínica que reservó el hueco (si está "booked").
  bookedByClinicId: uuid("booked_by_clinic_id").references(() => users.id, {
    onDelete: "set null",
  }),
  bookedAt: timestamp("booked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type NewAvailabilitySlot = typeof availabilitySlots.$inferInsert;

/**
 * Notificaciones in-app (la campana del dashboard). `type` es texto libre con
 * valores conocidos (ver NotificationType) en vez de enum, porque la lista de
 * tipos crecerá a menudo y no queremos una migración por cada uno.
 */
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  // Ruta interna a la que lleva al hacer clic (p.ej. /dashboard/clinic/surgeries/:id).
  link: text("link"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

/** Tipos de notificación conocidos. Texto en BD; este union da seguridad en TS. */
export type NotificationType =
  | "new_surgery" // a técnicos: nueva cirugía compatible publicada
  | "application_received" // a la clínica: un técnico se postuló
  | "application_confirmed" // al técnico: la clínica le dio la plaza
  | "application_rejected" // al técnico: la clínica lo descartó
  | "surgery_filled" // a la clínica: la cirugía cubrió todas sus vacantes
  | "surgery_updated" // a los inscritos: la clínica cambió datos de la cirugía
  | "surgery_cancelled" // a los inscritos: la cirugía fue retirada/eliminada
  | "slot_booked" // al técnico: una clínica reservó su disponibilidad (Fase 2)
  | "surgery_invitation"; // al técnico: una clínica le invitó a una cirugía desde el directorio
