"use client";

import { useApp } from "@/components/providers/Providers";
import { useToast } from "@/components/providers/ToastProvider";
import { errorText } from "@/lib/errors";

/** Forma estándar de retorno de las server actions del proyecto. */
export type ActionResultLike = { ok: true } | { error: string };

/**
 * Estandariza el feedback de una server action: si hay error, muestra un toast
 * con el mensaje TRADUCIDO (a partir del código que devuelve la action); si va
 * bien y se pasa `successMsg`, muestra un toast de éxito. Devuelve `true` cuando
 * la acción tuvo éxito, para encadenar la lógica del componente.
 *
 *   const { report } = useActionToast();
 *   if (report(await action(), t.dashboard.toasts.confirmed)) onOk();
 */
export function useActionToast() {
  const { t } = useApp();
  const { toast } = useToast();

  function report(res: ActionResultLike, successMsg?: string): boolean {
    if ("error" in res) {
      toast(errorText(res.error, t), "error");
      return false;
    }
    if (successMsg) toast(successMsg, "success");
    return true;
  }

  return { report };
}
