"use client";

import { useFormStatus } from "react-dom";
import { signOut } from "@backend/auth/sign-out";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/components/providers/Providers";

function SubmitInner() {
  const { t } = useApp();
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full items-center gap-3 px-4 py-2 text-[13px] font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center text-red-500">
        {pending ? (
          <Spinner size="sm" solid label={t.auth.signingOut} />
        ) : (
          <svg
            className="h-[18px] w-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
          </svg>
        )}
      </span>
      <span className="flex-1 text-left">
        {pending ? t.auth.signingOut : t.auth.signOut}
      </span>
      {!pending && (
        <kbd className="font-mono text-[10px] text-red-400/70 group-hover:text-red-500">⇧⌘Q</kbd>
      )}
    </button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOut}>
      <SubmitInner />
    </form>
  );
}
