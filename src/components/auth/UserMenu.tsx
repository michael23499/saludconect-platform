"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import { useApp } from "@/components/providers/Providers";

type Role = "professional" | "clinic" | "admin";

type Props = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: Role | null;
};

type MenuItem = { href: string; label: string; icon: React.ReactNode; shortcut?: string };
type MenuSection = { label: string; items: MenuItem[] };

export function UserMenu({ fullName, email, avatarUrl, role }: Props) {
  const { t } = useApp();
  const a = t.auth;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const base = role === "clinic" ? "/dashboard/clinic" : "/dashboard/professional";
  // Settings href según rol (admin no tiene /dashboard/admin)
  const settingsHref =
    role === "admin" ? "/admin" : role ? `${base}/settings` : "/complete-profile";

  const sections: MenuSection[] =
    role === "admin"
      ? [
          {
            label: a.mAdministration,
            items: [
              // Las secciones del admin son tabs del panel único /admin por ahora.
              // Cuando existan como subrutas (/admin/users, etc.) se actualizan aquí.
              { href: "/admin", label: a.mOverview, icon: <IconDashboard />, shortcut: "⌘D" },
              { href: "/admin", label: a.mApprovals, icon: <IconCheck /> },
              { href: "/admin", label: a.mUsers, icon: <IconTeam /> },
              { href: "/admin", label: a.mPayments, icon: <IconCard /> },
              { href: "/admin", label: a.mStats, icon: <IconChart /> },
              { href: "/admin", label: a.mModeration, icon: <IconShield /> },
            ],
          },
          {
            label: a.mSupervision,
            items: [
              { href: "/dashboard/professional", label: a.mProfessionalPanel, icon: <IconUser /> },
              { href: "/dashboard/clinic", label: a.mClinicPanel, icon: <IconTeam /> },
            ],
          },
        ]
      : role === "clinic"
      ? [
          {
            label: a.mAccount,
            items: [
              { href: base, label: a.mMyPanel, icon: <IconDashboard />, shortcut: "⌘D" },
              { href: `${base}/calendar`, label: a.mCalendar, icon: <IconCalendar /> },
              { href: `${base}/bookings`, label: a.mBookings, icon: <IconBookmark /> },
              { href: `${base}/publish`, label: a.mPublish, icon: <IconPlus /> },
              { href: `${base}/team`, label: a.mTeam, icon: <IconTeam /> },
              { href: `${base}/messages`, label: a.mMessages, icon: <IconChat />, shortcut: "⌘M" },
            ],
          },
          {
            label: a.mPreferences,
            items: [
              { href: `${base}/subscription`, label: a.mSubscription, icon: <IconCard /> },
              { href: `${base}/settings`, label: a.mSettings, icon: <IconSettings />, shortcut: "⌘," },
            ],
          },
        ]
      : role === "professional"
      ? [
          {
            label: a.mAccount,
            items: [
              { href: base, label: a.mMyPanel, icon: <IconDashboard />, shortcut: "⌘D" },
              { href: `${base}/calendar`, label: a.mMyCalendar, icon: <IconCalendar /> },
              { href: `${base}/bookings`, label: a.mMyBookings, icon: <IconBookmark /> },
              { href: `${base}/messages`, label: a.mMessages, icon: <IconChat />, shortcut: "⌘M" },
              { href: `${base}/documents`, label: a.mDocuments, icon: <IconDoc /> },
            ],
          },
          {
            label: a.mPreferences,
            items: [
              { href: `${base}/profile`, label: a.mMyPublicProfile, icon: <IconUser /> },
              { href: `${base}/settings`, label: a.mSettings, icon: <IconSettings />, shortcut: "⌘," },
            ],
          },
        ]
      : [
          {
            label: a.mStart,
            items: [
              { href: "/complete-profile", label: a.mCompleteProfile, icon: <IconUser /> },
            ],
          },
        ];

  const roleMeta =
    role === "clinic"
      ? { label: a.roleClinicLabel, dotClass: "bg-emerald-500" }
      : role === "professional"
      ? { label: a.roleProfessionalLabel, dotClass: "bg-brand-500" }
      : role === "admin"
      ? { label: a.roleAdminLabel, dotClass: "bg-amber-500" }
      : { label: a.roleNoneLabel, dotClass: "bg-mist-400" };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-mist-200 bg-white pl-1 pr-3 text-sm font-medium text-ink-800 transition hover:bg-mist-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={avatarUrl} initials={initials} variant="sm" />
        <span className="max-w-[120px] truncate">{fullName.split(" ")[0] || a.userFallback}</span>
        <svg
          className={`h-3.5 w-3.5 text-mist-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 origin-top-right animate-menu-in overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-[0_20px_50px_-12px_rgba(10,22,51,0.18)]"
        >
          {/* Cabecera limpia (sin gradiente fuerte) */}
          <Link
            href={settingsHref}
            onClick={() => setOpen(false)}
            className="group block border-b border-mist-200 bg-gradient-to-br from-brand-50 to-cyan-50/40 p-4 transition hover:from-brand-50 hover:to-cyan-50/60"
          >
            <div className="flex items-center gap-3">
              <Avatar src={avatarUrl} initials={initials} variant="lg" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink-900">{fullName || a.noName}</div>
                <div className="truncate text-xs text-mist-500">{email}</div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-mist-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${roleMeta.dotClass}`} />
                  {roleMeta.label}
                </div>
              </div>
              <svg
                className="h-4 w-4 flex-none text-mist-400 transition group-hover:translate-x-0.5 group-hover:text-mist-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
          </Link>

          {/* Secciones */}
          {sections.map((section, i) => (
            <div key={i} className={`py-2 ${i > 0 ? "border-t border-mist-200" : ""}`}>
              <div className="px-4 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-mist-400">
                {section.label}
              </div>
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 px-4 py-2 text-[13px] text-ink-800 transition hover:bg-mist-50"
                >
                  <span className="text-mist-500 group-hover:text-ink-700">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="font-mono text-[10px] text-mist-400 group-hover:text-mist-500">
                      {item.shortcut}
                    </kbd>
                  )}
                </Link>
              ))}
            </div>
          ))}

          {/* Cerrar sesión */}
          <div className="border-t border-mist-200 py-2">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ src, initials, variant }: { src: string | null; initials: string; variant: "sm" | "lg" }) {
  const cls = variant === "lg" ? "h-11 w-11 text-sm" : "h-7 w-7 text-[11px]";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${cls} rounded-full object-cover ring-1 ring-mist-200`} />;
  }
  return (
    <span
      className={`${cls} inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-500 font-semibold text-white ring-1 ring-brand-700/10`}
    >
      {initials || "?"}
    </span>
  );
}

/* Iconos stroke 1.5 — más finos y elegantes */
const sw = "1.5";
function IconDashboard() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}
function IconBookmark() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconTeam() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.6-.8L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  );
}
function IconCard() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
