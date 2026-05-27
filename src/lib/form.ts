/**
 * Normalización de valores de formularios y metadata. Antes estaba repetido como
 * `parseIntOrNull` (surgeries.ts) y `str()`/`num()` (ensure-profile.ts) con la
 * misma lógica. Una sola fuente evita divergencias.
 */

/** Entero o null: vacío / no numérico → null. Acepta valores de FormData. */
export function parseIntOrNull(v: FormDataEntryValue | null | undefined): number | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

/** Cadena recortada o null (vacío → null). Acepta cualquier valor. */
export function parseStringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Número (float) o null. Acepta number o string; vacío / no numérico → null. */
export function parseFloatOrNull(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
