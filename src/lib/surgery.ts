/**
 * Resumen de plazas de una cirugía mostrando solo los tipos que pide: técnicos,
 * médicos o ambos (p. ej. "2 técnicos · 1 médico"). Las palabras llegan del
 * diccionario i18n para respetar el idioma y el singular/plural.
 */
export function formatNeeds(
  vacancies: number,
  doctorsNeeded: number,
  w: { technician: string; technicians: string; doctor: string; doctors: string },
): string {
  const parts: string[] = [];
  if (vacancies > 0) parts.push(`${vacancies} ${vacancies === 1 ? w.technician : w.technicians}`);
  if (doctorsNeeded > 0) parts.push(`${doctorsNeeded} ${doctorsNeeded === 1 ? w.doctor : w.doctors}`);
  return parts.join(" · ") || `0 ${w.technicians}`;
}

/** " (HH:MM–HH:MM)" o "" si falta alguna hora. Para textos de aviso/notificación. */
export function formatSchedule(start: string | null, end: string | null): string {
  return start && end ? ` (${start}–${end})` : "";
}
