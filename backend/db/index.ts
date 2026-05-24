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

// Reutilizamos el cliente entre recargas de HMR en desarrollo. Sin esto, cada
// recompilación crea un pool de postgres-js nuevo sin cerrar el anterior, lo
// que agota rápidamente las conexiones del pooler de Supabase (free tier) —
// se nota, p.ej., al teclear en el buscador, que dispara muchas peticiones
// seguidas y acaba en "Failed query". `max` acota el pool e `idle_timeout`
// libera conexiones ociosas.
const globalForDb = globalThis as unknown as {
  __saludconetPg?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__saludconetPg ??
  postgres(url ?? "", { prepare: false, max: 10, idle_timeout: 20 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__saludconetPg = client;
}

export const db = drizzle(client, { schema });
export * from "./schema";
