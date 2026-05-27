"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkEmailStatus } from "./check-email";
import { dashboardPathForRole } from "./paths";
import { getRequestOrigin } from "./origin";
import { rateLimit } from "./rate-limit";
import { ensureProfileFromMetadata } from "./ensure-profile";

export type SignUpState =
  | null
  | { kind: "error"; message: string }
  // Confirmación de email activada: la cuenta de Supabase Auth se creó, pero el
  // perfil NO se materializa hasta que el usuario confirma el correo. La UI
  // muestra "revisa tu correo".
  | { kind: "confirm-email"; email: string };

/** Mínimo de caracteres de contraseña, alineado con setPasswordAction. */
const MIN_PASSWORD = 8;

/**
 * Alta con email + contraseña desde /register (clínica o profesional).
 *
 * Importante: NO creamos el perfil en public.users aquí. Guardamos todos los
 * datos del formulario en el `user_metadata` de Supabase Auth y el perfil se
 * materializa (ensureProfileFromMetadata) SOLO cuando el usuario confirma el
 * correo (en /auth/confirm) — o al instante si la confirmación está desactivada
 * y signUp ya devuelve sesión. Así la BD solo tiene cuentas confirmadas, sin
 * perfiles "fantasma" de altas que nunca se verifican.
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

  // Ambos roles deben aceptar la Política de Reservas (la aceptación se sella en
  // el perfil al materializarlo, con la versión vigente de la política).
  if (!formData.get("policy_consent")) {
    return {
      kind: "error",
      message: "Debes leer y aceptar la Política de Reservas para continuar.",
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

  // Especialidades de la clínica (multi-select). Para profesional no aplica.
  const specialties =
    role === "clinic"
      ? formData.getAll("especialidades").filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      : [];

  // Nombre para saludar en el correo: la persona de contacto (clínica) o el
  // nombre de pila (profesional). Si falta, cae al nombre completo.
  const contactName =
    role === "clinic"
      ? (cleanField(formData.get("contact")) ?? fullName)
      : (cleanField(formData.get("firstName")) ?? fullName);

  const origin = await getRequestOrigin();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      // TODO el alta vive aquí hasta que se confirme el correo: ensureProfileFromMetadata
      // lee estos campos para crear el perfil. lat/lng/specialties incluidos.
      data: {
        role,
        full_name: fullName,
        contact_name: contactName,
        phone: cleanField(formData.get("phone")),
        city: cleanField(formData.get("city")),
        address: cleanField(formData.get("address")),
        postal_code: cleanField(formData.get("postalCode")),
        lat: parseCoord(formData.get("lat")),
        lng: parseCoord(formData.get("lng")),
        profession: cleanField(formData.get("profesion")),
        pro_type: cleanField(formData.get("pro_type")),
        specialty_choice: cleanField(formData.get("especialidad")),
        team_size: cleanField(formData.get("tamano")),
        specialties: specialties.length ? specialties : null,
      },
    },
  });

  if (error) {
    return { kind: "error", message: prettifySignUpError(error.message) };
  }

  // Confirmación DESACTIVADA → signUp ya devuelve sesión: materializamos el
  // perfil ahora mismo desde el metadata y entramos al panel.
  if (data.session) {
    try {
      await ensureProfileFromMetadata(data.user);
    } catch {
      return {
        kind: "error",
        message: "Tu cuenta se creó pero no pudimos completar el perfil. Inicia sesión para terminar.",
      };
    }
    redirect(dashboardPathForRole(role)); // fuera del try (redirect lanza)
  }

  // Confirmación ACTIVADA → el perfil se crea al confirmar el correo (/auth/confirm).
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
