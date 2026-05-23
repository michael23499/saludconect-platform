import "server-only";
import { cookies } from "next/headers";
import { DICT, type Lang, type Dict } from "./i18n";

/** Nombre de la cookie donde guardamos el idioma elegido. */
export const LANG_COOKIE = "scn_lang";

/**
 * Lee el idioma de la cookie en Server Components / Route Handlers.
 * Default "es" si no hay cookie.
 */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(LANG_COOKIE)?.value;
  return v === "en" ? "en" : "es";
}

/** Diccionario traducido para el idioma actual (server-side). */
export async function getDict(): Promise<Dict> {
  return DICT[await getLang()];
}
