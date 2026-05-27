import "server-only";

/**
 * ¿El usuario NO es dueño del recurso? true si no es admin y el dueño no coincide.
 * Centraliza el check de propiedad repetido en muchas actions
 * (`!isAdmin && ownerId !== me.id`). El admin (soporte) siempre pasa.
 */
export function notOwner(ownerId: string, userId: string, isAdmin = false): boolean {
  return !isAdmin && ownerId !== userId;
}
