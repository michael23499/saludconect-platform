import type { ReactNode } from "react";
import { requireRole } from "@backend/auth/guards";
import { countPendingApprovals } from "@backend/queries/stats";
import { getDict } from "@/lib/i18n-server";
import { DashboardShell, type NavItem } from "@/components/dashboard/Shell";
import { NAV_ADMIN } from "@/lib/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Protege todo el área admin: sin sesión → /login; sin rol admin → su propio
  // dashboard. (Admin tiene acceso a todo.)
  const current = await requireRole("admin");
  const t = await getDict();

  // Badge de "Aprobaciones" con el conteo REAL de perfiles pendientes (antes
  // estaba hardcodeado a 8). Se oculta solo si no hay nada pendiente.
  const pending = await countPendingApprovals();
  const nav: NavItem[] = NAV_ADMIN.map((item) =>
    item.href === "/admin/approvals"
      ? { ...item, badge: pending > 0 ? String(pending) : undefined }
      : item,
  );

  const adminName =
    current.profile.fullName ??
    current.auth.fullNameFromProvider ??
    current.auth.email ??
    "Admin";
  const adminAvatar =
    current.profile.avatarUrl ?? current.auth.avatarUrlFromProvider ?? null;

  return (
    <DashboardShell
      role={t.dashboard.shell.roleAdmin}
      accent="admin"
      user={{ name: adminName, subtitle: t.dashboard.admin.fullAccess, avatarUrl: adminAvatar }}
      nav={nav}
    >
      {children}
    </DashboardShell>
  );
}
