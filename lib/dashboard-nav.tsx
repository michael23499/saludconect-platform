import type { NavItem } from "@/components/dashboard/Shell";

export const DASH_ICONS = {
  home: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12L12 4l9 8" /><path d="M5 10v10h14V10" /></svg>,
  cal: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  inbox: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l3-7h12l3 7v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" /><path d="M3 12h6l2 3h2l2-3h6" /></svg>,
  chat: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12c0 4.4-4 8-9 8-1.4 0-2.7-.2-3.9-.7L3 21l1.7-4.6C3.6 15 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" /></svg>,
  doc: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" /></svg>,
  user: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0114 0" /></svg>,
  cog: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.1-1.4l2-1.6-2-3.4-2.4.9a7 7 0 00-2.4-1.4L13.5 2h-3l-.6 2.1a7 7 0 00-2.4 1.4l-2.4-.9-2 3.4 2 1.6A7 7 0 005 12c0 .5 0 .9.1 1.4l-2 1.6 2 3.4 2.4-.9a7 7 0 002.4 1.4l.6 2.1h3l.6-2.1a7 7 0 002.4-1.4l2.4.9 2-3.4-2-1.6c.1-.5.1-.9.1-1.4z" /></svg>,
  search: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" /></svg>,
  team: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="3.5" /><path d="M3 20a6 6 0 0112 0" /><circle cx="17" cy="10" r="2.5" /><path d="M14 20a4 4 0 018 0" /></svg>,
  card: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></svg>,
};

export const NAV_PRO: NavItem[] = [
  { href: "/dashboard/profesional", label: "Resumen", icon: DASH_ICONS.home },
  { href: "/dashboard/profesional/calendario", label: "Calendario", icon: DASH_ICONS.cal },
  { href: "/dashboard/profesional/reservas", label: "Reservas", icon: DASH_ICONS.inbox, badge: "3" },
  { href: "/dashboard/profesional/mensajes", label: "Mensajes", icon: DASH_ICONS.chat, badge: "2" },
  { href: "/dashboard/profesional/documentos", label: "Documentos", icon: DASH_ICONS.doc },
  { href: "/dashboard/profesional/perfil", label: "Mi perfil", icon: DASH_ICONS.user },
  { href: "/dashboard/profesional/ajustes", label: "Ajustes", icon: DASH_ICONS.cog },
];

export const NAV_CLINICA: NavItem[] = [
  { href: "/dashboard/clinica", label: "Resumen", icon: DASH_ICONS.home },
  { href: "/dashboard/clinica/calendario", label: "Calendario", icon: DASH_ICONS.cal },
  { href: "/dashboard/clinica/reservas", label: "Reservas", icon: DASH_ICONS.inbox, badge: "5" },
  { href: "/dashboard/clinica/mensajes", label: "Mensajes", icon: DASH_ICONS.chat, badge: "3" },
  { href: "/dashboard/clinica/equipo", label: "Mi equipo", icon: DASH_ICONS.team },
  { href: "/dashboard/clinica/suscripcion", label: "Suscripción", icon: DASH_ICONS.card },
  { href: "/dashboard/clinica/ajustes", label: "Ajustes", icon: DASH_ICONS.cog },
];

export const USER_PRO = { name: "Dra. Lucía Martín", subtitle: "Cardióloga · Madrid" } as const;
export const USER_CLINICA = { name: "Clínica Mediterránea", subtitle: "Marta Vives · Gerente" } as const;
