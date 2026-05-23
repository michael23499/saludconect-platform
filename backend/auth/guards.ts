import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "./get-user";
import { dashboardPathForRole } from "./paths";

type Role = "professional" | "clinic" | "admin";

export type AuthedUser = CurrentUser;
export type ProfiledUser = CurrentUser & {
  profile: NonNullable<CurrentUser["profile"]>;
};

/**
 * Garantiza sesión activa. Si no hay sesión → redirige a /login.
 * Devuelve user + perfil (perfil puede ser null si aún no completó registro).
 *
 * Uso típico: páginas/layouts que solo requieren estar logueado pero permiten
 * users sin perfil completo (ej. /complete-profile, /set-password).
 */
export async function requireSession(): Promise<AuthedUser> {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/login");
  }
  return current;
}

/**
 * Garantiza sesión + perfil completado.
 * - Sin sesión → /login
 * - Con sesión, sin perfil → /complete-profile
 *
 * Uso típico: cualquier área autenticada que requiera rol asignado.
 */
export async function requireProfile(): Promise<ProfiledUser> {
  const current = await requireSession();
  if (!current.profile) {
    redirect("/complete-profile");
  }
  return current as ProfiledUser;
}

/**
 * Garantiza sesión + perfil + rol específico (o uno de varios).
 * Si el rol no coincide, redirige al dashboard del rol del user.
 * Admin tiene acceso a todo automáticamente.
 *
 * Uso típico: layouts de dashboards específicos por rol.
 *
 * @example
 *   const user = await requireRole("professional");
 *   // Aquí user.profile.role es "professional" o "admin"
 */
export async function requireRole(role: Role | Role[]): Promise<ProfiledUser> {
  const current = await requireProfile();
  const allowed = Array.isArray(role) ? role : [role];
  if (current.profile.role !== "admin" && !allowed.includes(current.profile.role)) {
    redirect(dashboardPathForRole(current.profile.role));
  }
  return current;
}

/**
 * Lo contrario: garantiza que NO hay sesión. Si hay user logueado,
 * redirige a su dashboard (o /complete-profile si no tiene rol).
 *
 * Uso típico: /login y /register — si ya estás logueado no tiene sentido verlas.
 */
export async function requireGuest(): Promise<void> {
  const current = await getCurrentUser();
  if (!current) return;
  if (!current.profile) {
    redirect("/complete-profile");
  }
  redirect(dashboardPathForRole(current.profile.role));
}

/**
 * Boolean check sin redirección. Útil para condicionales en UI
 * (mostrar/ocultar elementos según haya sesión o no).
 */
export async function isAuthenticated(): Promise<boolean> {
  const current = await getCurrentUser();
  return !!current;
}
