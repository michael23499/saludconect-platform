"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { UserActionsMenu } from "@/components/admin/UserActionsMenu";
import { loadUsersPage, type UsersFiltersRaw } from "@backend/actions/admin-users";
import type { User } from "@backend/db";
import type { Lang } from "@/lib/i18n";

type AdminDict = Record<string, string>;

const ROLE_META: Record<User["role"], { labelKey: string; tone: "brand" | "accent" | "warning" }> = {
  professional: { labelKey: "roleProfessional", tone: "brand" },
  clinic: { labelKey: "roleClinic", tone: "accent" },
  admin: { labelKey: "roleAdmin", tone: "warning" },
};

export function AdminUsersTable({
  initialUsers,
  rawFilters,
  pageSize,
  d,
  lang,
  adminId,
  filtered,
}: {
  initialUsers: User[];
  rawFilters: UsersFiltersRaw;
  pageSize: number;
  d: AdminDict;
  lang: Lang;
  adminId: string;
  filtered: boolean;
}) {
  const fmtDate = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", year: "numeric" });

  const [rows, setRows] = useState<User[]>(initialUsers);
  const [hasMore, setHasMore] = useState(initialUsers.length >= pageSize);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    loadUsersPage(rawFilters, rows.length)
      .then((next) => {
        setRows((prev) => [...prev, ...next]);
        setHasMore(next.length >= pageSize);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  }, [loading, hasMore, rawFilters, rows.length, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMore(); },
      { rootMargin: "240px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, hasMore]);

  // Actualización optimista: las acciones del kebab/modal parchean la fila en
  // el estado local para que el cambio se vea al instante (la tabla es client
  // y no reacciona sola a revalidatePath).
  const patchUser = useCallback((id: string, patch: Partial<User>) => {
    setRows((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  return (
    <div className="rounded-2xl border border-mist-200 bg-white">
      <div className="flex items-center justify-between border-b border-mist-100 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.allUsers}</div>
          <div className="text-lg font-semibold tracking-tight text-ink-900">
            {rows.length}{hasMore ? "+" : ""} {rows.length === 1 ? d.usersUnitOne : d.usersUnit}
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-mist-500">
          {filtered ? d.noResults : d.emptyUsers}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm [&_td]:align-middle">
            <thead className="bg-mist-50/60 text-left text-[11px] font-semibold uppercase tracking-wider text-mist-500">
              <tr>
                <th className="px-5 py-3 font-semibold">{d.colUser}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold">{d.colRole}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold">{d.colPhone}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold">{d.colCity}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold">{d.colStatus}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold">{d.colJoined}</th>
                <th className="w-px px-5 py-3" aria-label={d.actions} />
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {rows.map((u) => {
                const role = ROLE_META[u.role];
                return (
                  <tr key={u.id} className={u.suspended ? "bg-mist-50/40 opacity-60" : "hover:bg-mist-50/40"}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.fullName} src={u.avatarUrl ?? undefined} size="md" />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-ink-900">{u.fullName}</div>
                          <div className="truncate text-xs text-mist-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <Badge tone={role.tone}>{d[role.labelKey]}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-mist-600">{u.phone || "—"}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-mist-600">{u.city || "—"}</td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {u.suspended ? (
                        <Badge tone="danger">{d.statusSuspended}</Badge>
                      ) : u.verified ? (
                        <Badge tone="success">{d.verified}</Badge>
                      ) : (
                        <Badge tone="neutral">{d.unverified}</Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-mist-500">{fmtDate.format(u.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <UserActionsMenu
                        user={{ id: u.id, fullName: u.fullName, email: u.email, role: u.role, phone: u.phone, city: u.city, address: u.address, postalCode: u.postalCode, lat: u.lat, lng: u.lng, avatarUrl: u.avatarUrl, verified: u.verified, suspended: u.suspended }}
                        isSelf={u.id === adminId}
                        d={d}
                        onPatch={patchUser}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Sentinel para lazy load */}
          <div ref={sentinelRef} />
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-mist-500">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" /><path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
              {d.loadingMore}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
