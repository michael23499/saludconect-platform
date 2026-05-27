// Gestión del consentimiento de cookies (lado cliente).
//
// Guardamos la decisión del usuario en una cookie propia, legible tanto en
// cliente como —si en el futuro hiciera falta condicionar scripts en el
// servidor— en Server Components / Route Handlers. Hoy la plataforma solo usa
// cookies técnicas (scn_lang, scn_theme); las categorías "analytics" y
// "functional" quedan preparadas para cuando se incorporen esos scripts.

/** Cookie donde persiste la decisión de consentimiento. */
export const CONSENT_COOKIE = "scn_cookie_consent";

/**
 * Versión de la política de cookies. Si se modifican las categorías o el texto
 * legal, súbela: un consentimiento con versión anterior se considera caducado
 * y se vuelve a pedir.
 */
export const CONSENT_VERSION = 1;

/** Evento global para reabrir el panel de preferencias desde cualquier sitio. */
export const OPEN_PREFS_EVENT = "scn:open-cookie-prefs";

/** Categorías opcionales que el usuario puede activar/desactivar. */
export type ConsentCategories = {
  analytics: boolean;
  functional: boolean;
};

/** Decisión completa almacenada en la cookie. */
export type Consent = ConsentCategories & {
  v: number;
  /** Las técnicas son imprescindibles: siempre true. */
  necessary: true;
  /** Marca de tiempo de la decisión (epoch ms). */
  ts: number;
};

/**
 * Lee y valida la cookie de consentimiento. Devuelve `null` si no hay decisión,
 * si está corrupta o si pertenece a una versión anterior de la política (en cuyo
 * caso conviene volver a preguntar).
 */
export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as Partial<Consent>;
    if (parsed.v !== CONSENT_VERSION) return null;
    return {
      v: CONSENT_VERSION,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      functional: Boolean(parsed.functional),
      ts: typeof parsed.ts === "number" ? parsed.ts : Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Persiste la decisión del usuario durante un año y devuelve el objeto guardado.
 * Las cookies técnicas (necessary) siempre quedan aceptadas.
 */
export function writeConsent(categories: ConsentCategories): Consent {
  const consent: Consent = {
    v: CONSENT_VERSION,
    necessary: true,
    analytics: categories.analytics,
    functional: categories.functional,
    ts: Date.now(),
  };
  if (typeof document !== "undefined") {
    const value = encodeURIComponent(JSON.stringify(consent));
    // 1 año. samesite=lax basta: es una cookie de primera parte y no viaja en
    // peticiones cross-site sensibles.
    document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
  }
  return consent;
}

/** Dispara el evento que reabre el panel de preferencias de cookies. */
export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_PREFS_EVENT));
  }
}
