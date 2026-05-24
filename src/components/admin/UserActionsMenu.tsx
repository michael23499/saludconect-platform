"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  changeUserRoleAction,
  setUserVerifiedAction,
  setUserSuspendedAction,
} from "@backend/actions/admin-users";
import { EditUserModal } from "@/components/admin/EditUserModal";
import type { User } from "@backend/db";

type AdminDict = Record<string, string>;

type MenuUser = Pick<User, "id" | "fullName" | "email" | "role" | "phone" | "city" | "address" | "postalCode" | "lat" | "lng" | "avatarUrl" | "verified" | "suspended">;

const ROLES: User["role"][] = ["professional", "clinic", "admin"];
const ROLE_KEY: Record<User["role"], string> = {
  professional: "roleProfessional",
  clinic: "roleClinic",
  admin: "roleAdmin",
};
const ROLE_DOT: Record<User["role"], string> = {
  professional: "bg-brand-500",
  clinic: "bg-cyan-500",
  admin: "bg-amber-500",
};

export function UserActionsMenu({
  user,
  isSelf,
  d,
  onPatch,
}: {
  user: MenuUser;
  isSelf: boolean;
  d: AdminDict;
  onPatch: (id: string, patch: Partial<User>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [pending, startTransition] = useTransition();
  const btnRef = useRef<HTMLButtonElement>(null);

  // El menú es `fixed`: lo cerramos al hacer scroll/resize para que no se
  // desalinee, y con Escape.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setCoords({ top: r.bottom + 6, right: window.innerWidth - r.right });
    setOpen((v) => !v);
  }

  function run(fn: () => Promise<void>, patch?: Partial<User>) {
    setOpen(false);
    startTransition(async () => {
      try {
        await fn();
        if (patch) onPatch(user.id, patch);
      } catch (e) {
        alert(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={d.actions}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mist-500 transition hover:bg-mist-100 hover:text-ink-800 disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="menu"
            style={{ top: coords.top, right: coords.right }}
            className="scale-in fixed z-50 w-60 overflow-hidden rounded-xl border border-mist-200 bg-white py-1 text-left shadow-xl"
          >
            <div className="truncate px-3 pb-1.5 pt-1 text-xs font-semibold text-ink-900">{user.fullName}</div>

            <button
              role="menuitem"
              onClick={() => { setOpen(false); setEditOpen(true); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-800 hover:bg-mist-50"
            >
              <svg className="h-4 w-4 text-mist-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
              {d.edit}
            </button>

            <div className="my-1 h-px bg-mist-100" />

            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-mist-400">
              {d.changeRoleTo}
            </div>
            {ROLES.map((r) => {
              const current = r === user.role;
              return (
                <button
                  key={r}
                  role="menuitem"
                  disabled={isSelf || current}
                  onClick={() => run(() => changeUserRoleAction(user.id, r), { role: r })}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink-800 hover:bg-mist-50 disabled:cursor-default disabled:hover:bg-white"
                  title={isSelf ? d.selfActionDisabled : undefined}
                >
                  <span className={`flex items-center gap-2.5 ${current || isSelf ? "text-mist-400" : ""}`}>
                    <span className={`h-2 w-2 rounded-full ${ROLE_DOT[r]}`} />
                    {d[ROLE_KEY[r]]}
                  </span>
                  {current && (
                    <svg className="h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l5 5L20 7" /></svg>
                  )}
                </button>
              );
            })}

            <div className="my-1 h-px bg-mist-100" />

            <button
              role="menuitem"
              onClick={() => run(() => setUserVerifiedAction(user.id, !user.verified), { verified: !user.verified })}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-800 hover:bg-mist-50"
            >
              <svg className="h-4 w-4 text-mist-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
              {user.verified ? d.unverify : d.verifyAction}
            </button>

            <button
              role="menuitem"
              disabled={isSelf}
              onClick={() => {
                if (user.suspended) return run(() => setUserSuspendedAction(user.id, false), { suspended: false });
                if (confirm(d.suspendConfirm)) run(() => setUserSuspendedAction(user.id, true), { suspended: true });
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-default disabled:text-mist-300 disabled:hover:bg-white"
              title={isSelf ? d.selfActionDisabled : undefined}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>
              {user.suspended ? d.reactivate : d.suspend}
            </button>
          </div>
        </>
      )}

      {editOpen && (
        <EditUserModal
          user={{
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            city: user.city,
            address: user.address,
            postalCode: user.postalCode,
            lat: user.lat,
            lng: user.lng,
            avatarUrl: user.avatarUrl,
          }}
          d={d}
          onClose={() => setEditOpen(false)}
          onSaved={(patch) => onPatch(user.id, patch)}
        />
      )}
    </>
  );
}
