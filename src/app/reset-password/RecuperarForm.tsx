"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/components/providers/Providers";
import { requestPasswordReset, type ResetPasswordState } from "@backend/auth/reset-password";

const RESEND_COOLDOWN = 30; // segundos

export function RecuperarForm() {
  const [state, formAction] = useActionState<ResetPasswordState, FormData>(
    requestPasswordReset,
    null,
  );

  if (state && state.kind === "sent") {
    return <SentView email={state.email} />;
  }

  const errorMessage = state && state.kind === "error" ? state.message : null;
  return <ResetForm action={formAction} errorMessage={errorMessage} />;
}

function ResetForm({
  action,
  errorMessage,
}: {
  action: (fd: FormData) => void;
  errorMessage: string | null;
}) {
  const { t } = useApp();
  const a = t.auth;
  return (
    <form action={action} className="mt-8 space-y-4">
      <Field label={a.email}>
        <Input name="email" type="email" placeholder="tu@email.com" required autoComplete="email" />
      </Field>
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      <SubmitButton />
    </form>
  );
}

function SentView({ email }: { email: string }) {
  const { t } = useApp();
  const a = t.auth;
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [isResending, startResend] = useTransition();
  const [resentTick, setResentTick] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function handleResend() {
    if (cooldown > 0 || isResending) return;
    const fd = new FormData();
    fd.set("email", email);
    startResend(async () => {
      await requestPasswordReset(null, fd);
      setCooldown(RESEND_COOLDOWN);
      setResentTick((n) => n + 1);
    });
  }

  const disabled = cooldown > 0 || isResending;

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-600 ring-1 ring-emerald-200">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
        </span>
        <h3 className="mt-3 text-sm font-semibold text-ink-900">{a.checkEmail}</h3>
        <p className="mt-1 text-[13px] text-mist-600">
          {a.resetSentPrefix} <span className="font-medium text-ink-800">{email}</span> {a.resetSentDesc}
        </p>
      </div>

      {resentTick > 0 && !isResending && cooldown === RESEND_COOLDOWN && (
        <p className="text-center text-xs font-medium text-emerald-600">✓ {a.resent}</p>
      )}

      <Button
        variant="secondary"
        size="lg"
        className="w-full justify-center"
        onClick={handleResend}
        disabled={disabled}
      >
        {isResending ? (
          <>
            <Spinner size="sm" /> {a.resending}
          </>
        ) : cooldown > 0 ? (
          `${a.resendIn} ${cooldown}s`
        ) : (
          a.resend
        )}
      </Button>

      <p className="text-center text-xs text-mist-500">{a.checkSpam}</p>
    </div>
  );
}

function SubmitButton() {
  const { t } = useApp();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full justify-center" disabled={pending}>
      {pending ? (
        <>
          <Spinner size="sm" solid /> {t.auth.sendingLink}
        </>
      ) : (
        t.auth.sendResetLink
      )}
    </Button>
  );
}
