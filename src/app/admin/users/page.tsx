import { PageHeader } from "@/components/dashboard/Shell";
import { AdminUsersTable } from "@/components/admin/UsersTable";
import { UsersFilters } from "@/components/admin/UsersFilters";
import { InviteAdmin } from "@/components/admin/InviteAdmin";
import { getDict, getLang } from "@/lib/i18n-server";
import { buildUserFilters } from "@/lib/user-filters";
import { requireRole } from "@backend/auth/guards";
import { listUsers, USERS_PAGE_SIZE } from "@backend/queries/users";

export const metadata = { title: "Usuarios · SaludCoNet" };

type SearchParams = Promise<{ role?: string; from?: string; to?: string; q?: string }>;

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters = buildUserFilters(sp);
  const filtered = Boolean(filters.role || filters.since || filters.until || filters.search);

  const [t, lang, admin, users] = await Promise.all([
    getDict(),
    getLang(),
    requireRole("admin"), // cacheado por request; el layout ya lo verificó
    listUsers(filters, USERS_PAGE_SIZE), // primera página; el resto por lazy load
  ]);
  const d = t.dashboard.admin as Record<string, string>;

  // El export hereda los filtros activos de la tabla.
  const exportQs = new URLSearchParams(
    Object.entries(sp).filter((e): e is [string, string] => typeof e[1] === "string" && e[1] !== ""),
  ).toString();
  const exportHref = exportQs ? `/admin/users/export?${exportQs}` : "/admin/users/export";

  return (
    <>
      <PageHeader
        title={t.dashboard.nav.users}
        subtitle={d.usersDesc}
        actions={
          <>
            <InviteAdmin d={d} />
            <a
              href={exportHref}
              className="inline-flex items-center gap-2 rounded-lg border border-mist-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-800 transition hover:bg-mist-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
                <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
              {d.exportUsers}
            </a>
          </>
        }
      />
      <UsersFilters d={d} lang={lang} />
      <AdminUsersTable
        key={JSON.stringify(sp)}
        initialUsers={users}
        rawFilters={sp}
        pageSize={USERS_PAGE_SIZE}
        d={d}
        lang={lang}
        adminId={admin.profile.id}
        filtered={filtered}
      />
    </>
  );
}
