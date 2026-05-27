/**
 * Rutas internas del dashboard/admin en un solo sitio. Antes estaban como string
 * literal repetido en varias server actions y páginas (riesgo de typos y de que
 * un cambio de ruta no se propague). Importar desde aquí mantiene una sola fuente.
 */
export const ROUTES = {
  // Clínica
  clinicHome: "/dashboard/clinic",
  clinicSurgeries: "/dashboard/clinic/surgeries",
  clinicCalendar: "/dashboard/clinic/calendar",
  clinicBookings: "/dashboard/clinic/bookings",
  clinicTeam: "/dashboard/clinic/team",
  // Profesional
  proHome: "/dashboard/professional",
  proSurgeries: "/dashboard/professional/surgeries",
  proCalendar: "/dashboard/professional/calendar",
  proBookings: "/dashboard/professional/bookings",
  // Admin
  adminHome: "/admin",
  adminUsers: "/admin/users",
  adminApprovals: "/admin/approvals",
} as const;

/** Detalle de una cirugía bajo el panel de la clínica. */
export function clinicSurgery(id: string): string {
  return `${ROUTES.clinicSurgeries}/${id}`;
}

/** Detalle de una cirugía bajo el panel del profesional. */
export function proSurgery(id: string): string {
  return `${ROUTES.proSurgeries}/${id}`;
}
