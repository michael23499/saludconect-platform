"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { setUserVerifiedAction, setUserSuspendedAction } from "@backend/actions/admin-users";

/**
 * Botones reales de la cola de aprobaciones: aprobar = verificar la cuenta;
 * rechazar = suspenderla (reversible desde Usuarios), con confirmación previa
 * vía ConfirmDialog (nunca window.confirm). Las server actions revalidan las
 * rutas admin; refrescamos por si acaso para feedback inmediato.
 */
export function ApprovalActions({
  userId,
  labels,
}: {
  userId: string;
  labels: {
    approve: string;
    reject: string;
    rejectTitle: string;
    rejectMsg: string;
    cancel: string;
  };
}) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  const approve = () =>
    start(async () => {
      await setUserVerifiedAction(userId, true);
      router.refresh();
    });

  const reject = () =>
    start(async () => {
      await setUserSuspendedAction(userId, true);
      setConfirm(false);
      router.refresh();
    });

  return (
    <>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setConfirm(true)}
          disabled={pending}
          className="rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 transition hover:bg-mist-50 disabled:opacity-50"
        >
          {labels.reject}
        </button>
        <button
          type="button"
          onClick={approve}
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {labels.approve}
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        tone="danger"
        title={labels.rejectTitle}
        message={labels.rejectMsg}
        confirmLabel={labels.reject}
        cancelLabel={labels.cancel}
        pending={pending}
        onConfirm={reject}
        onClose={() => setConfirm(false)}
      />
    </>
  );
}
