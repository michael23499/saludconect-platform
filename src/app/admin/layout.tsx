import type { ReactNode } from "react";
import { requireRole } from "@backend/auth/guards";
import { getDict } from "@/lib/i18n-server";
import { DashboardShell } from "@/components/dashboard/Shell";
import { NAV_ADMIN } from "@/lib/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Protege todo el área admin: sin sesión → /login; sin rol admin → su propio
  // dashboard. (Admin tiene acceso a todo.)
  const current = await requireRole("admin");
  const t = await getDict();

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
      nav={NAV_ADMIN}
    >
      {children}
    </DashboardShell>
  );
}
