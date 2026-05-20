"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type NavItem = { href: string; label: string; icon: ReactNode; badge?: string };

export function DashboardShell({
  role,
  user,
  nav,
  children,
}: {
  role: "Clínica" | "Profesional" | "Administrador";
  user: { name: string; subtitle: string };
  nav: NavItem[];
  children: ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Lock body scroll while drawer open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeItem = nav.find((n) => n.href === path) ?? nav[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-mist-50">
      {/* Mobile sub-header */}
      <div className="sticky top-16 z-30 flex items-center justify-between gap-3 border-b border-mist-200 bg-white/85 px-4 py-2.5 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú del panel"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-mist-200 bg-white px-2.5 text-xs font-semibold text-ink-800 hover:bg-mist-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          Menú
        </button>
        <div className="min-w-0 flex-1 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-600">Área {role}</div>
          <div className="truncate text-[13px] font-semibold text-ink-900">{activeItem.label}</div>
        </div>
        <Avatar name={user.name} size="sm" />
      </div>

      <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-0 px-0 md:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-mist-200 bg-white md:block">
          <div className="sticky top-16">
            <SidebarBody role={role} user={user} nav={nav} path={path} />
          </div>
        </aside>

        <div className="min-w-0 p-4 md:p-8">{children}</div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="modal-backdrop absolute inset-0" onClick={() => setOpen(false)} />
          <aside className="scale-in relative ml-0 h-full w-[86%] max-w-xs border-r border-mist-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-mist-200 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-600">Área {role}</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-mist-200 text-ink-700 hover:bg-mist-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6l-12 12" /></svg>
              </button>
            </div>
            <div className="h-[calc(100%-49px)] overflow-y-auto">
              <SidebarBody role={role} user={user} nav={nav} path={path} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function SidebarBody({
  role,
  user,
  nav,
  path,
}: {
  role: string;
  user: { name: string; subtitle: string };
  nav: NavItem[];
  path: string;
}) {
  return (
    <>
      <div className="border-b border-mist-200 p-5">
        <div className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600 md:block">
          Área {role}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Avatar name={user.name} size="md" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink-900">{user.name}</div>
            <div className="truncate text-xs text-mist-500">{user.subtitle}</div>
          </div>
        </div>
      </div>
      <nav className="space-y-0.5 p-3">
        {nav.map((n) => {
          const active = path === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-brand-50 text-brand-700" : "text-ink-800 hover:bg-mist-50"
              )}
            >
              <span className="inline-flex items-center gap-3">
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg border", active ? "border-brand-200 bg-white text-brand-700" : "border-mist-200 bg-mist-50 text-ink-700")}>
                  {n.icon}
                </span>
                {n.label}
              </span>
              {n.badge && (
                <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {n.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 mt-6 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-4 dark:border-brand-500/30 dark:from-brand-500/15 dark:to-cyan-500/10">
        <div className="text-xs font-semibold text-brand-700 dark:!text-cyan-300">¿Necesitas ayuda?</div>
        <p className="mt-1 text-xs text-ink-800 dark:!text-slate-100">
          Nuestro equipo te asiste en menos de 12 h.
        </p>
        <Link
          href="/contacto"
          className="mt-3 inline-flex text-xs font-semibold text-brand-700 hover:text-brand-800 dark:!text-cyan-300 dark:hover:!text-cyan-200"
        >
          Contactar soporte →
        </Link>
      </div>
    </>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mist-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "up" | "down";
}) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">{value}</div>
      {hint && (
        <div
          className={cn(
            "mt-1 text-xs",
            tone === "up" && "text-emerald-600",
            tone === "down" && "text-red-600",
            tone === "neutral" && "text-mist-500"
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
