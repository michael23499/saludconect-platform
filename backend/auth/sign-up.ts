"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkEmailStatus, getAuthUserIdByEmail } from "./check-email";
import { dashboardPathForRole } from "./paths";
import { getRequestOrigin } from "./origin";
import { rateLimit } from "./rate-limit";
import { createUserProfile } from "../queries/users";
import { createProfessional } from "../queries/professionals";
import { createClinic } from "../queries/clinics";
import { getSpecialtyBySlug } from "../queries/specialties";
import { CAPILAR_SLUG } from "../db/seed-data";

export type SignUpState =
  | null
  | { kind: "error"; message: string }
  // Supabase tiene la confirmación de email activada: el alta quedó creada pero
  // el usuario debe confirmar su correo antes de tener sesión. La UI muestra
  // "revisa tu correo" en vez de redirigir.
  | { kind: "confirm-email"; email: string };

/** Mínimo de caracteres de contraseña, alineado con setPasswordAction. */
const MIN_PASSWORD = 8;

/**
 * Alta con email + contraseña desde /register (clínica o profesional). A
 * diferencia de /complete-profile (que completa el perfil de un usuario YA
 * autenticado, p.ej. vía Google), aquí creamos la cuenta de Supabase Auth y el
 * perfil de public.users en un solo paso, porque el formulario ya recoge rol,
 * nombre y datos de contacto.
 *
 * Robusto ante las dos configuraciones de Supabase:
 *   - "Confirm email" OFF → signUp devuelve sesión → redirigimos al dashboard.
 *   - "Confirm email" ON  → signUp NO devuelve sesión → estado "confirm-email";
 *     al confirmar, /auth/callback encuentra el perfil y entra al dashboard.
 *
 * El perfil se inserta vía Drizzle (conexión directa, sin RLS) usando el id que
 * devuelve signUp, así que existe desde el primer momento en ambos casos.
 */
export async function signUpAction(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const role = formData.get("role");
  if (role !== "professional" && role !== "clinic") {
    return { kind: "error", message: "Selecciona si eres una clínica o un profesional." };
  }

  const emailRaw = formData.get("email");
  const password = formData.get("password");

  if (typeof emailRaw !== "string" || !emailRaw.includes("@")) {
    return { kind: "error", message: "Introduce un email válido." };
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return {
      kind: "error",
      message: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`,
    };
  }
  const email = emailRaw.trim().toLowerCase();

  // Nombre que mostraremos: el del centro (clínica) o nombre+apellidos (técnico).
  const fullName = buildFullName(role, formData);
  if (fullName.length < 2) {
    return {
      kind: "error",
      message:
        role === "clinic"
          ? "Indica el nombre de la clínica."
          : "Indica tu nombre y apellidos.",
    };
  }

  // El profesional debe consentir la verificación documental (igual que el form).
  if (role === "professional" && !formData.get("docs_consent")) {
    return {
      kind: "error",
      message: "Debes aceptar la verificación de tu documentación profesional.",
    };
  }

  // Frena el abuso de creación masiva de cuentas por IP.
  const allowed = await rateLimit("signup", 8, 60_000);
  if (!allowed) {
    return { kind: "error", message: "Demasiados intentos. Espera un momento e inténtalo de nuevo." };
  }

  // Si ya hay cuenta con ese email, no intentamos crearla de nuevo: con la
  // confirmación activada Supabase devuelve un "éxito" silencioso para no
  // filtrar qué emails existen, y el usuario se quedaría esperando un correo
  // que no llega. En registro preferimos guiar a iniciar sesión.
  const status = await checkEmailStatus(email);
  if (status.exists) {
    return {
      kind: "error",
      message: "Ya existe una cuenta con este email. Inicia sesión.",
    };
  }

  const phone = cleanField(formData.get("phone"));
  const city = cleanField(formData.get("city"));
  const address = cleanField(formData.get("address"));
  const postalCode = cleanField(formData.get("postalCode"));
  // Coordenadas que vienen del autocompletado de dirección (Nominatim).
  const lat = parseCoord(formData.get("lat"));
  const lng = parseCoord(formData.get("lng"));

  const origin = await getRequestOrigin();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      // Guardamos rol y datos en user_metadata: getCurrentUser lee full_name de
      // aquí, y conservamos la profesión/especialidad/tamaño que el usuario eligió
      // aunque el schema todavía no tenga columna para ellos (el marketplace solo
      // opera en capilar por ahora).
      data: {
        role,
        full_name: fullName,
        phone,
        city,
        address,
        profession: cleanField(formData.get("profesion")),
        specialty_choice: cleanField(formData.get("especialidad")),
        team_size: cleanField(formData.get("tamano")),
      },
    },
  });

  // El id del usuario recién creado. Con la confirmación de email activada, el
  // SDK devuelve data.user=null (sin error) aunque la cuenta sí se creó, así que
  // lo recuperamos por email. El email es nuevo (validado arriba), no hay riesgo
  // de coger el id de otra cuenta.
  const userId = data.user?.id ?? (await getAuthUserIdByEmail(email));
  if (error || !userId) {
    return { kind: "error", message: prettifySignUpError(error?.message) };
  }

  // Crea el perfil base + el perfil extendido según el rol. Todo idempotente
  // (onConflictDoNothing): si el usuario reintenta, no revienta.
  try {
    await createUserProfile({
      id: userId,
      email,
      fullName,
      role,
      phone,
      city,
      address,
      postalCode,
      lat,
      lng,
      verified: false,
    });

    if (role === "professional") {
      // Por ahora el marketplace arranca solo con "Microinjerto capilar".
      const capilar = await getSpecialtyBySlug(CAPILAR_SLUG);
      await createProfessional({
        id: userId,
        specialtyId: capilar?.id ?? null,
        availableForWork: true,
      });
    } else {
      // Una clínica puede ofrecer varias especialidades (multi-select).
      const specialties = formData
        .getAll("especialidades")
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0);
      await createClinic({
        id: userId,
        clinicName: fullName,
        specialties: specialties.length ? specialties : null,
      });
    }
  } catch {
    return {
      kind: "error",
      message: "Tu cuenta se creó pero no pudimos completar el perfil. Inicia sesión para terminar.",
    };
  }

  // Con sesión (confirmación desactivada) entramos directos al panel. Sin
  // sesión, pedimos confirmar el correo. El redirect debe ir FUERA del try.
  if (data.session) {
    redirect(dashboardPathForRole(role));
  }
  return { kind: "confirm-email", email };
}

/** Nombre a guardar según el rol, a partir de los campos del formulario. */
function buildFullName(role: "professional" | "clinic", formData: FormData): string {
  if (role === "clinic") {
    return cleanField(formData.get("clinicName")) ?? "";
  }
  const first = cleanField(formData.get("firstName")) ?? "";
  const last = cleanField(formData.get("lastName")) ?? "";
  return `${first} ${last}`.trim();
}

/** Normaliza un campo de texto del formulario: trim y null si queda vacío. */
function cleanField(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Parsea una coordenada (lat/lng) del formulario; null si vacía o no numérica. */
function parseCoord(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Traduce los errores de Supabase Auth a mensajes que el usuario entiende.
 * Sin exponer el detalle técnico.
 */
function prettifySignUpError(raw: string | undefined): string {
  const msg = (raw ?? "").toLowerCase();
  if (msg.includes("already") || msg.includes("registered")) {
    return "Ya existe una cuenta con este email. Inicia sesión.";
  }
  if (msg.includes("password")) {
    return `La contraseña no es válida. Usa al menos ${MIN_PASSWORD} caracteres.`;
  }
  if (msg.includes("rate") || msg.includes("limit")) {
    return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
  }
  if (msg.includes("invalid") && msg.includes("email")) {
    return "El email no es válido.";
  }
  return "No pudimos crear la cuenta. Inténtalo de nuevo en unos minutos.";
}
