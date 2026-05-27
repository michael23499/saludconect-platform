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
  // Aceptación de la Política de Reservas (ver /legal/reservations). Se sella al
  // registrarse marcando el checkbox. Guardamos también la versión aceptada para
  // poder volver a pedir aceptación si la política cambia de forma relevante.
  reservationPolicyAcceptedAt: timestamp("reservation_policy_accepted_at", { withTimezone: true }),
  reservationPolicyVersion: text("reservation_policy_version"),
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

// Tipo de profesional: una cirugía puede necesitar un MÉDICO (lidera/realiza la
// intervención) o un TÉCNICO (apoyo: extracción, implantación, conteo…). Cada
// profesional es de UN solo tipo y la notificación de cada cirugía va al grupo
// correcto. Por compatibilidad, los perfiles existentes quedan como "technician".
export const professionalTypeEnum = pgEnum("professional_type", ["doctor", "technician"]);

/**
 * Perfil extendido del profesional/técnico (1:1 con users de rol professional).
 * Vive aparte de `users` para no ensuciar la tabla base de auth y porque solo
 * aplica a un rol. Se crea al completar el perfil.
 */
export const professionals = pgTable("professionals", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  // Médico o técnico. Rige a quién se notifica una cirugía según lo que pida.
  proType: professionalTypeEnum("pro_type").notNull().default("technician"),
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
  // Persona de contacto / responsable del centro (la que se da de alta). Se usa
  // para saludar por su nombre en el panel, ya que clinicName es el del centro.
  contactName: text("contact_name"),
  // Especialidades del centro (lista). Una clínica puede ofrecer varias. Son
  // etiquetas de perfil (las del catálogo de marketing del registro); el motor
  // de cirugías sigue operando por la specialtyId de cada cirugía.
  specialties: text("specialties").array(),
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
  // Nº de TÉCNICOS que necesita la clínica (vacantes de técnico a cubrir).
  vacancies: integer("vacancies").notNull().default(1),
  // Nº de MÉDICOS que necesita (independiente de los técnicos). Una cirugía
  // puede pedir solo técnicos, solo médicos o ambos.
  doctorsNeeded: integer("doctors_needed").notNull().default(0),
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
    // Momento en que la clínica confirmó la plaza: nace aquí el "compromiso de
    // colaboración". Sirve para fechar el compromiso y medir la antelación de una
    // cancelación posterior (ventanas 72h/24h).
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    // Quién canceló una reserva YA confirmada y por qué. cancelledBy es texto con
    // valores conocidos: "clinic" | "professional" | "admin". Se rellena al
    // retirarse/descartar tras la confirmación; alimenta el registro de fiabilidad.
    cancelledBy: text("cancelled_by"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelReason: text("cancel_reason"),
    // Asistencia tras la fecha: null = sin marcar, true = asistió, false = no se
    // presentó (no-show). La marca la otra parte. Penaliza la fiabilidad si false.
    attended: boolean("attended"),
    attendanceMarkedAt: timestamp("attendance_marked_at", { withTimezone: true }),
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

// open: el técnico lo ofrece (libre y visible) · pending: una clínica lo solicitó
// y queda BLOQUEADO esperando que el técnico acepte/rechace · booked: el técnico
// aceptó (reserva confirmada) · cancelled: el técnico lo retiró (o se canceló)
export const availabilityStatusEnum = pgEnum("availability_status", [
  "open",
  "pending",
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
  // Clínica que reservó el hueco (si está "booked"). bookedAt fecha el
  // compromiso (equivalente a confirmedAt de las cirugías).
  bookedByClinicId: uuid("booked_by_clinic_id").references(() => users.id, {
    onDelete: "set null",
  }),
  bookedAt: timestamp("booked_at", { withTimezone: true }),
  // Cancelación de una reserva YA confirmada (booked) y asistencia posterior.
  // Mismos campos y semántica que en `applications`. cancelledBy: texto con
  // "clinic" | "professional" | "admin". attended: null/true/false (no-show).
  cancelledBy: text("cancelled_by"),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  cancelReason: text("cancel_reason"),
  attended: boolean("attended"),
  attendanceMarkedAt: timestamp("attendance_marked_at", { withTimezone: true }),
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
  | "slot_requested" // al técnico: una clínica solicitó reservarle; debe aceptar/rechazar
  | "booking_confirmed" // a la clínica: el técnico confirmó la reserva solicitada
  | "booking_declined" // a la clínica: el técnico rechazó la reserva (el hueco se liberó)
  | "surgery_invitation" // al técnico: una clínica le invitó a una cirugía desde el directorio
  | "reservation_cancelled" // a la otra parte: una reserva YA confirmada fue cancelada (con motivo)
  | "review_request" // a ambos: el trabajo terminó, valora tu experiencia
  | "contact_message"; // al admin: alguien envió el formulario de contacto público

// ===========================================================================
// VALORACIONES — reputación bidireccional tras un trabajo
// ===========================================================================
// Cuando un trabajo termina (una cirugía confirmada o una reserva de
// disponibilidad aceptada cuya fecha ya pasó), ambas partes pueden valorarse:
// la clínica al profesional y el profesional a la clínica. Estrellas (1-5) +
// comentario opcional. El "contexto" identifica de qué trabajo proviene.

export const reviewContextEnum = pgEnum("review_context", ["surgery", "slot"]);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Quien valora y quien es valorado (ambos son users: clínica o profesional).
    raterId: uuid("rater_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ratedId: uuid("rated_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // De qué trabajo nace la valoración: una cirugía o una reserva (slot).
    contextType: reviewContextEnum("context_type").notNull(),
    // Id de la cirugía o del slot (sin FK porque apunta a dos tablas posibles).
    contextId: uuid("context_id").notNull(),
    // Puntuación de 1 a 5 estrellas.
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // Una sola valoración por (quien valora, a quién, trabajo concreto).
  (t) => [
    unique("reviews_rater_rated_context_uq").on(t.raterId, t.ratedId, t.contextType, t.contextId),
  ],
);

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

// ===========================================================================
// EQUIPO DE LA CLÍNICA — profesionales de confianza guardados
// ===========================================================================
// La clínica guarda técnicos/médicos que ya conoce (todos profesionales
// registrados) para invitarlos rápido a sus cirugías sin buscarlos cada vez.
// Es un vínculo clínica → profesional; un profesional una sola vez por equipo.

export const clinicTeam = pgTable(
  "clinic_team",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("clinic_team_clinic_pro_uq").on(t.clinicId, t.professionalId)],
);

export type ClinicTeamRow = typeof clinicTeam.$inferSelect;
export type NewClinicTeamRow = typeof clinicTeam.$inferInsert;

// ===========================================================================
// CONTENIDO EDITABLE — textos legales gestionables por el admin
// ===========================================================================
// Store genérico de contenido por clave + idioma. Hoy lo usa el admin para
// sobrescribir los textos legales (cookies, privacidad, etc.) como texto largo;
// si no hay fila para una (key, lang), la página cae al texto por defecto del
// i18n. Genérico a propósito: añadir contenido editable = una clave nueva, sin
// migración.

export const siteContent = pgTable(
  "site_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Clave estable del contenido (p.ej. "cookies", "privacy", "terms").
    key: text("key").notNull(),
    // Idioma del texto ("es" | "en").
    lang: text("lang").notNull(),
    // Cuerpo en texto largo (formato simple: "## " encabezados, "- " listas).
    body: text("body").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("site_content_key_lang_uq").on(t.key, t.lang)],
);

export type SiteContent = typeof siteContent.$inferSelect;
export type NewSiteContent = typeof siteContent.$inferInsert;
