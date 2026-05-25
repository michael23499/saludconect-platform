import "dotenv/config";
import { db, specialties } from "../db";
import { SEED_SPECIALTIES } from "../db/seed-data";

/**
 * Siembra el catálogo de especialidades. Idempotente: usa onConflictDoNothing
 * sobre el slug único, así que se puede correr tantas veces como haga falta
 * (p.ej. tras añadir una especialidad nueva a SEED_SPECIALTIES).
 *
 * Uso: npm run db:seed-specialties  (después de `npm run db:push`).
 */
async function main() {
  console.log(`[seed] Sembrando ${SEED_SPECIALTIES.length} especialidad(es)…`);
  for (const s of SEED_SPECIALTIES) {
    const rows = await db
      .insert(specialties)
      .values({ slug: s.slug, name: s.name })
      .onConflictDoNothing({ target: specialties.slug })
      .returning();
    console.log(rows.length ? `  + creada: ${s.name}` : `  = ya existía: ${s.name}`);
  }
  console.log("[seed] Listo.");
  process.exit(0);
}

main().catch((e) => {
  console.error("[seed] Error:", e);
  process.exit(1);
});
