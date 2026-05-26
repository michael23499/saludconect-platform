import "server-only";
import type { User } from "@supabase/supabase-js";
import { createUserProfile } from "../queries/users";
import { createProfessional } from "../queries/professionals";
import { createClinic } from "../queries/clinics";
import { getSpecialtyBySlug } from "../queries/specialties";
import { CAPILAR_SLUG } from "../db/seed-data";

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
    phone: str(m.phone),
    city: str(m.city),
    address: str(m.address),
    postalCode: str(m.postal_code),
    lat: num(m.lat),
    lng: num(m.lng),
    verified: false,
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
    await createClinic({ id: user.id, clinicName: fullName, specialties: specialties.length ? specialties : null });
  }
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
