import { and, eq } from "drizzle-orm";
import { db, siteContent, type SiteContent } from "../db";

/** Claves de contenido legal editables y la ruta pública de cada una. */
export const LEGAL_CONTENT: { key: string; path: string }[] = [
  { key: "privacy", path: "/legal/privacy" },
  { key: "legal-notice", path: "/legal/legal-notice" },
  { key: "terms", path: "/legal/terms" },
  { key: "cookies", path: "/legal/cookies" },
  { key: "reservations", path: "/legal/reservations" },
];

/**
 * Cuerpo guardado para una (clave, idioma), o null si no hay override. Tolera
 * que la tabla aún no exista (antes del db:push): devuelve null y la página cae
 * al texto por defecto, sin romper. Las páginas legales son públicas.
 */
export async function getSiteContent(key: string, lang: string): Promise<string | null> {
  try {
    const rows = await db
      .select({ body: siteContent.body })
      .from(siteContent)
      .where(and(eq(siteContent.key, key), eq(siteContent.lang, lang)))
      .limit(1);
    return rows[0]?.body ?? null;
  } catch {
    return null;
  }
}

/** Todo el contenido editable (para la pantalla del admin). Tolera tabla ausente. */
export async function getAllSiteContent(): Promise<SiteContent[]> {
  try {
    return await db.select().from(siteContent);
  } catch {
    return [];
  }
}

/**
 * Guarda (o actualiza) el cuerpo de una (clave, idioma). Si el cuerpo queda
 * vacío, BORRA la fila: así "vaciar" un texto = volver al texto por defecto del
 * i18n (la página cae al fallback).
 */
export async function upsertSiteContent(key: string, lang: string, body: string): Promise<void> {
  const trimmed = body.trim();
  if (!trimmed) {
    await db.delete(siteContent).where(and(eq(siteContent.key, key), eq(siteContent.lang, lang)));
    return;
  }
  await db
    .insert(siteContent)
    .values({ key, lang, body: trimmed })
    .onConflictDoUpdate({
      target: [siteContent.key, siteContent.lang],
      set: { body: trimmed, updatedAt: new Date() },
    });
}
