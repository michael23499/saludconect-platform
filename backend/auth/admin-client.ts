import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con la SECRET KEY (permisos de servicio: bypassa RLS y
 * habilita la admin API — invitar/borrar usuarios, etc.). SOLO server-side.
 * NUNCA importar desde un client component ni exponer la clave al navegador.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en el entorno.",
    );
  }
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
