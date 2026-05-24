"use client";

import { useRef, useState, useTransition } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalField,
  modalInputCls,
  modalBtnPrimary,
  modalBtnSecondary,
} from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { inviteUserAction } from "@backend/actions/admin-users";

type AdminDict = Record<string, string>;
type Role = "professional" | "clinic" | "admin";

const ROLE_KEY: Record<Role, string> = {
  professional: "roleProfessional",
  clinic: "roleClinic",
  admin: "roleAdmin",
};

const PersonPlusIcon = (
  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0112 0" /><path d="M18 8v6M21 11h-6" /></svg>
  </span>
);

export function InviteAdmin({ d }: { d: AdminDict }) {
  const [open, setOpen] = useState(false);
  const [instance, setInstance] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  function openModal() {
    setInstance((n) => n + 1);
    setOpen(true);
  }

  function handleSent(email: string) {
    setOpen(false);
    setToast(`${d.inviteSentMsg} ${email}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-2 rounded-sm bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0112 0" /><path d="M18 8v6M21 11h-6" />
        </svg>
        {d.invite}
      </button>

      {open && <InviteModal key={instance} d={d} onClose={() => setOpen(false)} onSent={handleSent} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}

function InviteModal({
  d,
  onClose,
  onSent,
}: {
  d: AdminDict;
  onClose: () => void;
  onSent: (email: string) => void;
}) {
  const [role, setRole] = useState<Role>("professional");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await inviteUserAction(null, fd);
      if (res?.kind === "sent") onSent(res.email);
      else if (res?.kind === "error") setError(res.message);
    });
  }

  return (
    <Modal onClose={onClose} maxWidth={460} labelledBy="invite-title">
      <ModalHeader
        icon={PersonPlusIcon}
        eyebrow={d.invite}
        title={d.inviteUser}
        subtitle={d[ROLE_KEY[role]]}
        onClose={onClose}
        titleId="invite-title"
        closeLabel={d.cancel}
      />

      <form ref={formRef} onSubmit={submit}>
        <input type="hidden" name="role" value={role} />
        <ModalBody>
          <p className="text-sm text-mist-500">{d.inviteDesc}</p>

          <ModalField label={d.colRole}>
            <div className="flex gap-2">
              {(["professional", "clinic", "admin"] as Role[]).map((r) => {
                const active = r === role;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={
                      "flex-1 rounded-sm border px-2 py-2 text-sm font-medium transition " +
                      (active
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-mist-200 text-ink-700 hover:bg-mist-50")
                    }
                  >
                    {d[ROLE_KEY[r]]}
                  </button>
                );
              })}
            </div>
          </ModalField>

          <ModalField label={d.fieldName}>
            <input name="fullName" className={modalInputCls} placeholder={d.namePlaceholder} autoFocus required />
          </ModalField>
          <ModalField label={d.colEmail}>
            <input name="email" type="email" className={modalInputCls} placeholder="persona@ejemplo.com" required />
          </ModalField>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </ModalBody>

        <ModalFooter>
          <button type="button" onClick={onClose} className={modalBtnSecondary}>{d.cancel}</button>
          <button type="submit" disabled={pending} className={modalBtnPrimary}>{pending ? d.inviteSending : d.inviteSend}</button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
