/**
 * Datos semilla del catálogo de especialidades. Por ahora el marketplace
 * arranca SOLO con "Microinjerto capilar" (el sector que el cliente conoce y
 * donde va a impactar primero). Añadir una especialidad nueva = una entrada
 * aquí + volver a correr `npm run db:seed-specialties` (es idempotente).
 */
export const CAPILAR_SLUG = "microinjerto-capilar";

export const SEED_SPECIALTIES: { slug: string; name: string }[] = [
  { slug: CAPILAR_SLUG, name: "Microinjerto capilar" },
];
