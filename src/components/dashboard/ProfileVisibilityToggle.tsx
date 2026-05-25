"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";
import { setProfileVisibilityAction } from "@backend/actions/profile";

/**
 * Toggle real (persiste en BD) para que el técnico decida aparecer o no en el
 * directorio público (/search). Opt-out: por defecto está activo.
 */
export function ProfileVisibilityToggle({ initial }: { initial: boolean }) {
  const router = useRouter();
  const p = useApp().t.dashboard.prof;
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const res = await setProfileVisibilityAction(next);
      if ("error" in res) setOn(!next);
      else router.refresh();
    });
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink-900">{p.visLabel}</div>
        <p className="mt-0.5 text-xs text-mist-500">{p.visDesc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={p.visLabel}
        disabled={pending}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          on ? "bg-brand-600" : "bg-mist-300",
          pending && "opacity-60",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            on ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
