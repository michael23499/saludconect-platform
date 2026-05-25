import "dotenv/config";
import { listUsers } from "../queries/users";
import { createProfessional } from "../queries/professionals";
import { createClinic } from "../queries/clinics";
import { getSpecialtyBySlug } from "../queries/specialties";
import { CAPILAR_SLUG } from "../db/seed-data";

/**
 * Crea las filas professionals/clinics para los usuarios que se registraron
 * ANTES de que el onboarding las creara automáticamente. Idempotente
 * (onConflictDoNothing): correr las veces que haga falta sin riesgo.
 *
 * Uso: npm run db:backfill-profiles  (después de db:push + db:seed-specialties).
 */
async function main() {
  const capilar = await getSpecialtyBySlug(CAPILAR_SLUG);
  if (!capilar) {
    console.error("[backfill] No existe la especialidad capilar. Corre antes `npm run db:seed-specialties`.");
    process.exit(1);
  }

  const pros = await listUsers({ role: "professional" });
  for (const u of pros) {
    await createProfessional({ id: u.id, specialtyId: capilar.id, availableForWork: true });
  }
  console.log(`[backfill] Profesionales procesados: ${pros.length} (especialidad capilar asignada).`);

  const clinics = await listUsers({ role: "clinic" });
  for (const u of clinics) {
    await createClinic({ id: u.id, clinicName: u.fullName });
  }
  console.log(`[backfill] Clínicas procesadas: ${clinics.length}.`);

  console.log("[backfill] Listo.");
  process.exit(0);
}

main().catch((e) => {
  console.error("[backfill] Error:", e);
  process.exit(1);
});
