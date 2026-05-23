import "server-only";
import { sql } from "drizzle-orm";
import { db } from "../db";

export type EmailStatus = {
  exists: boolean;
  hasPassword: boolean;
  providers: string[];
};

/**
 * Consulta auth.users / auth.identities directamente (vía Drizzle SQL raw)
 * para saber si un email está registrado y qué métodos de auth tiene.
 *
 * - exists: hay user con ese email
 * - hasPassword: tiene identidad con provider 'email' (= password)
 * - providers: lista de providers (google, email, ...)
 *
 * Solo invocar desde server-only (server actions / route handlers).
 */
export async function checkEmailStatus(email: string): Promise<EmailStatus> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    return { exists: false, hasPassword: false, providers: [] };
  }

  // Query única, eficiente:
  //   - exists: ¿hay user en auth.users con este email?
  //   - has_password: ¿tiene encrypted_password? (mirar la columna directamente,
  //     NO la identity 'email': al añadir password a una cuenta OAuth con
  //     updateUser({ password }), Supabase rellena encrypted_password pero NO
  //     crea una identity 'email'. Comprobar la columna cubre ambos casos.)
  //   - providers: lista de providers de auth (google, email, github, …)
  const result = await db.execute<{
    exists: boolean;
    has_password: boolean;
    providers: string[] | null;
  }>(sql`
    SELECT
      EXISTS(SELECT 1 FROM auth.users WHERE email = ${normalized}) AS exists,
      EXISTS(
        SELECT 1 FROM auth.users
        WHERE email = ${normalized}
          AND encrypted_password IS NOT NULL
          AND encrypted_password != ''
      ) AS has_password,
      (
        SELECT array_agg(DISTINCT i.provider)
        FROM auth.identities i
        JOIN auth.users u ON u.id = i.user_id
        WHERE u.email = ${normalized}
      ) AS providers
  `);

  // postgres-js devuelve un array con las filas. La primera fila es nuestra respuesta.
  const row = (result as unknown as Array<{ exists: boolean; has_password: boolean; providers: string[] | null }>)[0];

  return {
    exists: !!row?.exists,
    hasPassword: !!row?.has_password,
    providers: row?.providers ?? [],
  };
}
