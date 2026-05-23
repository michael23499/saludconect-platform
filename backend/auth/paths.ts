export type UserRole = "professional" | "clinic" | "admin";

/**
 * Path del panel según el rol. El admin vive en `/admin`, no en
 * `/dashboard/admin` (esa ruta no existe), así que hay que mapearlo aparte.
 * Centralizar esto evita 404 al redirigir tras login/guards.
 */
export function dashboardPathForRole(role: UserRole | string): string {
  if (role === "admin") return "/admin";
  return `/dashboard/${role}`;
}
