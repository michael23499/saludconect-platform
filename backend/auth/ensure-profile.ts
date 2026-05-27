import "server-only";
import type { User } from "@supabase/supabase-js";
import { createUserProfile } from "../queries/users";
import { createProfessional } from "../queries/professionals";
import { createClinic } from "../queries/clinics";
import { getSpecialtyBySlug } from "../queries/specialties";
import { CAPILAR_SLUG } from "../db/seed-data";
import { RESERVATION_POLICY_VERSION } from "../policy/reservation";
import { parseStringOrNull, parseFloatOrNull } from "@/lib/form";

/**
 * Materializa el perfil de public.users a partir del user_metadata que guardó
 * signUpAction. Se llama cuando el usuario CONFIRMA el correo (o al instante si
 * Supabase tiene la confirmación desactivada), de modo que SOLO las cuentas
 * confirmadas tienen perfil — sin "fantasmas" de altas sin verificar.
 *
 * Idempotente (las queries usan onConflictDoNothing): si el perfil ya existe,
 * no duplica. Si el metadata no trae datos de alta (p.ej. un usuario que entró
 * por Google), no hace nada: ese caso lo cubre /complete-profile.
 */
export async function ensureProfileFromMetadata(user: User | null | undefined): Promise<void> {
  if (!user) return;
  const m = (user.user_metadata ?? {}) as Record<string, unknown>;

  const role = m.role;
  if (role !== "professional" && role !== "clinic") return;

  const fullName = typeof m.full_name === "string" ? m.full_name.trim() : "";
  if (fullName.length < 2) return;

  await createUserProfile({
    id: user.id,
    email: user.email ?? "",
    fullName,
    role,
    phone: parseStringOrNull(m.phone),
    city: parseStringOrNull(m.city),
    address: parseStringOrNull(m.address),
    postalCode: parseStringOrNull(m.postal_code),
    lat: parseFloatOrNull(m.lat),
    lng: parseFloatOrNull(m.lng),
    verified: false,
    // El alta exige aceptar la Política de Reservas (signUpAction lo valida);
    // sellamos la aceptación con la versión vigente al materializar el perfil.
    reservationPolicyAcceptedAt: new Date(),
    reservationPolicyVersion: RESERVATION_POLICY_VERSION,
  });

  if (role === "professional") {
    // Por ahora el marketplace arranca solo con "Microinjerto capilar".
    const capilar = await getSpecialtyBySlug(CAPILAR_SLUG);
    // Médico o técnico según el alta; por defecto técnico.
    const proType = m.pro_type === "doctor" ? "doctor" : "technician";
    await createProfessional({
      id: user.id,
      proType,
      specialtyId: capilar?.id ?? null,
      availableForWork: true,
    });
  } else {
    const specialties = Array.isArray(m.specialties)
      ? (m.specialties as unknown[]).filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      : [];
    await createClinic({
      id: user.id,
      clinicName: fullName,
      // Persona de contacto que se dio de alta (para saludarla por su nombre).
      contactName: parseStringOrNull(m.contact_name),
      specialties: specialties.length ? specialties : null,
    });
  }
}
