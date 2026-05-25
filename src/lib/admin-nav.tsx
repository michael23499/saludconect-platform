import type { NavItem } from "@/components/dashboard/Shell";

export const ADMIN_ICONS = {
  home: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12L12 4l9 8" /><path d="M5 10v10h14V10" /></svg>,
  check: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg>,
  team: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="3.5" /><path d="M3 20a6 6 0 0112 0" /></svg>,
  card: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="13" rx="2" /></svg>,
  chart: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V8M10 20V4M16 20v-9M22 20H2" /></svg>,
  flag: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 21V4l13 4-5 3 5 3-13 0" /></svg>,
  surgery: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3l2 5 4-12 2 7h2" /><circle cx="19.5" cy="12" r="1.6" /></svg>,
  pro: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0114 0" /></svg>,
};

// Cada sección del admin es ya una ruta propia (/admin/approvals, etc.).
// Las dos entradas de "supervisión" llevan a los paneles de clínica/profesional,
// que en modo admin muestran la actividad GLOBAL de la plataforma (solo lectura).
export const NAV_ADMIN: NavItem[] = [
  { href: "/admin", labelKey: "overview", icon: ADMIN_ICONS.home },
  { href: "/admin/users", labelKey: "users", icon: ADMIN_ICONS.team },
  { href: "/dashboard/clinic/surgeries", label: "Supervisar cirugías", icon: ADMIN_ICONS.surgery },
  { href: "/dashboard/professional/surgeries", label: "Vista profesional", icon: ADMIN_ICONS.pro },
  { href: "/admin/approvals", labelKey: "approvals", icon: ADMIN_ICONS.check, badge: "8" },
  { href: "/admin/payments", labelKey: "payments", icon: ADMIN_ICONS.card },
  { href: "/admin/stats", labelKey: "stats", icon: ADMIN_ICONS.chart },
  { href: "/admin/moderation", labelKey: "moderation", icon: ADMIN_ICONS.flag },
];
