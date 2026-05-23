import "dotenv/config";
import postgres from "postgres";

/**
 * Migra los valores del enum `user_role` de español a inglés:
 *   profesional → professional
 *   clinica     → clinic
 *   (admin se mantiene)
 *
 * `ALTER TYPE ... RENAME VALUE` conserva las filas existentes (no recrea el
 * enum), por eso NO se puede hacer con `drizzle-kit push`. Es idempotente:
 * solo renombra si el label antiguo todavía existe, así que puedes ejecutarlo
 * más de una vez sin error.
 *
 * Uso:  tsx backend/scripts/migrate-role-enum.ts
 */
const RENAMES: Array<{ from: string; to: string }> = [
  { from: "profesional", to: "professional" },
  { from: "clinica", to: "clinic" },
];

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ Define DIRECT_URL (o DATABASE_URL) en .env");
    process.exit(1);
  }

  const sql = postgres(url, { prepare: false, max: 1 });

  try {
    const labels = await sql<{ enumlabel: string }[]>`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'user_role'
    `;
    const current = new Set(labels.map((l) => l.enumlabel));
    console.log("🏷  Valores actuales de user_role:", [...current].join(", ") || "(ninguno)");

    for (const { from, to } of RENAMES) {
      if (current.has(to)) {
        console.log(`✓ '${to}' ya existe — nada que hacer`);
        continue;
      }
      if (!current.has(from)) {
        console.log(`⚠ '${from}' no existe y '${to}' tampoco — lo salto`);
        continue;
      }
      await sql.unsafe(`ALTER TYPE user_role RENAME VALUE '${from}' TO '${to}'`);
      console.log(`✅ Renombrado '${from}' → '${to}'`);
    }

    const after = await sql<{ enumlabel: string }[]>`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'user_role'
      ORDER BY e.enumsortorder
    `;
    console.log("\n🎉 Listo. user_role =", after.map((l) => l.enumlabel).join(", "));
  } catch (err) {
    console.error("\n❌ Error en la migración:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
