import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL no está definida en .env");
    process.exit(1);
  }

  console.log("🔌 Conectando a Supabase Postgres (Transaction pooler)...");
  const sql = postgres(url, { prepare: false, max: 1 });

  try {
    const [{ version }] = await sql<{ version: string }[]>`SELECT version()`;
    const [{ now }] = await sql<{ now: Date }[]>`SELECT NOW() as now`;
    const [{ db, usr }] = await sql<{ db: string; usr: string }[]>`
      SELECT current_database() as db, current_user as usr
    `;

    console.log("\n✅ Conexión exitosa\n");
    console.log("  Database :", db);
    console.log("  User     :", usr);
    console.log("  Server   :", now.toISOString());
    console.log("  Version  :", version.split(",")[0]);
  } catch (err) {
    console.error("\n❌ Error de conexión:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
