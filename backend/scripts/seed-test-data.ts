import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { getSpecialtyBySlug } from "../queries/specialties";
import { createUserProfile } from "../queries/users";
import { createProfessional } from "../queries/professionals";
import { createClinic } from "../queries/clinics";
import { createSurgery } from "../queries/surgeries";
import { createAvailabilitySlot } from "../queries/availability";
import { CAPILAR_SLUG } from "../db/seed-data";

/**
 * Siembra datos de PRUEBA para ver el marketplace con contenido: técnicos
 * capilares (con disponibilidad publicada) y clínicas (con cirugías abiertas).
 * Pensado para desarrollo/demo, NO para producción.
 *
 * Idempotente: si una cuenta ya existe (por email) la reutiliza y NO vuelve a
 * crear su disponibilidad/cirugías, para no duplicar en re-ejecuciones.
 *
 * Uso: npm run db:seed-test   (después de db:push + db:seed-specialties)
 * Todas las cuentas comparten la misma contraseña: ver TEST_PASSWORD abajo.
 */

const TEST_PASSWORD = "Prueba1234!";

const PROFESSIONALS = [
  { email: "tecnico1@test.saludconet.com", fullName: "Marta Ruiz", city: "Madrid", headline: "Técnica capilar FUE", bio: "Técnica especializada en extracción FUE con 6 años en quirófano capilar.", yearsExperience: 6, hourlyRate: 35 },
  { email: "tecnico2@test.saludconet.com", fullName: "Javier Soler", city: "Barcelona", headline: "Especialista en microinjerto", bio: "Implantación y extracción. Acostumbrado a jornadas largas y alto volumen.", yearsExperience: 4, hourlyRate: 30 },
  { email: "tecnico3@test.saludconet.com", fullName: "Lucía Ferrer", city: "Valencia", headline: "Técnica capilar senior", bio: "9 años de experiencia, formación de equipos y control de calidad.", yearsExperience: 9, hourlyRate: 40 },
  { email: "tecnico4@test.saludconet.com", fullName: "Diego Nava", city: "Sevilla", headline: "Auxiliar capilar", bio: "Apoyo en extracción e implantación, disponibilidad amplia.", yearsExperience: 2, hourlyRate: 25 },
];

const CLINICS = [
  { email: "clinica1@test.saludconet.com", fullName: "Clínica Capilar Sur", city: "Madrid" },
  { email: "clinica2@test.saludconet.com", fullName: "Injerta Barcelona", city: "Barcelona" },
];

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

/**
 * Cliente admin de Supabase creado aquí mismo (sin pasar por
 * backend/auth/admin-client.ts, que importa "server-only" y no funciona en un
 * script tsx fuera del bundler de Next).
 */
function createAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env");
  }
  return createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Crea (o recupera) la cuenta de auth. Devuelve {id, wasNew}. */
async function ensureAuthUser(
  admin: ReturnType<typeof createAdmin>,
  email: string,
  fullName: string,
): Promise<{ id: string; wasNew: boolean }> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (!error && data.user) return { id: data.user.id, wasNew: true };

  // Ya existía → buscarlo por email entre los usuarios.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) throw error ?? new Error(`No se pudo crear ni encontrar ${email}`);
  return { id: existing.id, wasNew: false };
}

async function main() {
  const admin = createAdmin();

  const capilar = await getSpecialtyBySlug(CAPILAR_SLUG);
  if (!capilar) {
    throw new Error("Falta la especialidad capilar. Corre antes: npm run db:seed-specialties");
  }

  console.log("[seed-test] Creando profesionales de prueba…");
  const proIds: string[] = [];
  for (const p of PROFESSIONALS) {
    const { id, wasNew } = await ensureAuthUser(admin, p.email, p.fullName);
    proIds.push(id);
    await createUserProfile({
      id,
      email: p.email,
      fullName: p.fullName,
      role: "professional",
      city: p.city,
      verified: true,
    });
    await createProfessional({
      id,
      specialtyId: capilar.id,
      headline: p.headline,
      bio: p.bio,
      yearsExperience: p.yearsExperience,
      hourlyRate: p.hourlyRate,
      availableForWork: true,
    });

    if (wasNew) {
      // Publicar disponibilidad solo para cuentas nuevas (evita duplicar).
      const offsets = [3, 6, 10];
      for (const off of offsets) {
        await createAvailabilitySlot({
          professionalId: id,
          specialtyId: capilar.id,
          date: futureDate(off),
          startTime: off % 2 === 0 ? "09:00" : null,
          endTime: off % 2 === 0 ? "15:00" : null,
          note: off === 10 ? "Solo mañanas" : null,
          status: "open",
        });
      }
    }
    console.log(`  ${wasNew ? "+ creado" : "= ya existía"}: ${p.fullName} (${p.email})`);
  }

  console.log("[seed-test] Creando clínicas de prueba…");
  for (const c of CLINICS) {
    const { id, wasNew } = await ensureAuthUser(admin, c.email, c.fullName);
    await createUserProfile({
      id,
      email: c.email,
      fullName: c.fullName,
      role: "clinic",
      city: c.city,
      verified: true,
    });
    await createClinic({ id, clinicName: c.fullName });

    if (wasNew) {
      await createSurgery({
        clinicId: id,
        specialtyId: capilar.id,
        title: "Microinjerto capilar",
        description: "Jornada de microinjerto capilar. Material e instrumental incluidos.",
        date: futureDate(4),
        startTime: "09:00",
        endTime: "17:00",
        city: c.city,
        vacancies: 2,
        ratePerHour: 30,
        urgent: false,
        status: "open",
      });
      await createSurgery({
        clinicId: id,
        specialtyId: capilar.id,
        title: "Cobertura capilar urgente",
        description: "Necesitamos un técnico adicional para una jornada de alto volumen.",
        date: futureDate(8),
        startTime: "10:00",
        endTime: "18:00",
        city: c.city,
        vacancies: 1,
        ratePerHour: 35,
        urgent: true,
        status: "open",
      });
    }
    console.log(`  ${wasNew ? "+ creada" : "= ya existía"}: ${c.fullName} (${c.email})`);
  }

  console.log("\n[seed-test] Listo. Cuentas de prueba (contraseña común):");
  console.log(`  Contraseña: ${TEST_PASSWORD}`);
  console.log("  Profesionales:", PROFESSIONALS.map((p) => p.email).join(", "));
  console.log("  Clínicas:", CLINICS.map((c) => c.email).join(", "));
  process.exit(0);
}

main().catch((e) => {
  console.error("[seed-test] Error:", e);
  process.exit(1);
});
