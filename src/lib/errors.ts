import type { Dict } from "@/lib/i18n";

/**
 * Códigos de error que devuelven las server actions (en vez de mensajes en duro).
 * La UI los traduce con `errorText` usando el diccionario (`t.errors`). Así el
 * mensaje es bilingüe y consistente. Añadir un código = añadir su clave en
 * `errors` (es+en) de i18n.
 */
export type ErrorCode =
  | "generic"
  | "not_found"
  | "not_owner"
  | "admin_supervises"
  | "admin_no_invite"
  | "surgery_closed"
  | "already_applied"
  | "already_enrolled"
  | "already_rejected"
  | "reason_required"
  | "no_spots_tech"
  | "no_spots_doctor"
  | "need_one_slot"
  | "vacancies_range"
  | "invalid_date"
  | "past_date"
  | "need_date"
  | "too_many_dates"
  | "end_before_start"
  | "action_failed"
  | "specialty_unavailable"
  | "admin_pick_clinic"
  | "invalid_clinic"
  | "slot_taken"
  | "slot_not_open"
  | "slot_not_pending"
  | "slot_gone"
  | "attendance_not_confirmed"
  | "attendance_too_early"
  | "too_many_attempts";

/**
 * Traduce un `error` devuelto por una action. Si es un código conocido, devuelve
 * su texto traducido. Si es un código desconocido en formato snake_case, cae al
 * mensaje genérico. Si es texto libre (acciones aún sin migrar a códigos), lo
 * muestra tal cual — así la migración a códigos puede ser incremental sin romper.
 */
export function errorText(error: string | undefined | null, t: Dict): string {
  const errs = t.errors as unknown as Record<string, string>;
  if (!error) return errs.generic;
  if (errs[error]) return errs[error];
  return /^[a-z][a-z0-9_]*$/.test(error) ? errs.generic : error;
}
