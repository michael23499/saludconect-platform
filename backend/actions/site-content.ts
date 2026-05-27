"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../auth/guards";
import { upsertSiteContent, LEGAL_CONTENT } from "../queries/site-content";

export type ActionResult = { ok: true } | { error: string };

/**
 * El admin guarda el texto largo de un documento legal en un idioma. Vaciarlo
 * vuelve al texto por defecto. Solo admin. Revalida la página pública afectada.
 */
export async function saveSiteContentAction(
  key: string,
  lang: string,
  body: string,
): Promise<ActionResult> {
  await requireRole("admin");
  const entry = LEGAL_CONTENT.find((c) => c.key === key);
  if (!entry || (lang !== "es" && lang !== "en")) return { error: "generic" };

  await upsertSiteContent(key, lang, body);
  revalidatePath(entry.path);
  revalidatePath("/admin/content");
  return { ok: true };
}
