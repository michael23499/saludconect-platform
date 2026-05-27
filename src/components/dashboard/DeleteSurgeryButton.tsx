"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/Providers";
import { useActionToast } from "@/lib/use-action-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteSurgeryAction } from "@backend/actions/surgeries";

/**
 * Botón para "eliminar" una cirugía. No la borra de la BD: es un soft-delete
 * (la oculta de los listados, reversible). Lo usan la clínica DUEÑA y el ADMIN.
 * Confirma con un diálogo propio y avisa de que se notificará a los inscritos.
 */
export function DeleteSurgeryButton({
  surgeryId,
  asAdmin = false,
}: {
  surgeryId: string;
  asAdmin?: boolean;
}) {
  const router = useRouter();
  const s = useApp().t.dashboard.surgeries;
  const { report } = useActionToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function doDelete() {
    startTransition(async () => {
      if (report(await deleteSurgeryAction(surgeryId))) {
        router.push("/dashboard/clinic/surgeries");
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex h-9 items-center gap-2 rounded-sm border border-red-200 bg-white px-3.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-400/30 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
        {pending ? s.deleting : s.deleteCta}
      </button>
      <ConfirmDialog
        open={open}
        title={s.delTitle}
        message={asAdmin ? s.delConfirmAdmin : s.delConfirm}
        confirmLabel={s.deleteCta}
        cancelLabel={s.cancel}
        tone="danger"
        pending={pending}
        onConfirm={doDelete}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
