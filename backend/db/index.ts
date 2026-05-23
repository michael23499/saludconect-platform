import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// NO lanzamos en import-time: rompería el build de Next al prerenderizar
// páginas (p.ej. /_not-found) que arrastran este módulo sin usar la BD.
// postgres-js es lazy (no conecta hasta la primera query), así que con URL
// vacía el módulo se evalúa sin error; solo fallaría una query real sin
// DATABASE_URL configurada.
const url = process.env.DATABASE_URL;
if (!url) {
  console.warn(
    "[db] DATABASE_URL no está definida — configúrala en .env (local) o en las env vars de Vercel (producción).",
  );
}

const client = postgres(url ?? "", { prepare: false });

export const db = drizzle(client, { schema });
export * from "./schema";
