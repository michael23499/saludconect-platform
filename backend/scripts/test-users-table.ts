import "dotenv/config";
import { db, users } from "../db";

async function main() {
  console.log("🔍 Verificando tabla users...\n");

  const rows = await db.select().from(users).limit(5);

  console.log(`✅ Tabla 'users' existe. Filas: ${rows.length}`);
  if (rows.length > 0) console.table(rows);
  else console.log("   (tabla vacía, lo esperado en primer arranque)");

  process.exit(0);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
