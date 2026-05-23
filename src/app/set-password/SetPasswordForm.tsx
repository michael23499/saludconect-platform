"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/components/providers/Providers";
import { setPasswordAction, type SetPasswordState } from "@backend/auth/setup-password";

export function SetPasswordForm() {
  const { t } = useApp();
  const a = t.auth;
  const [state, formAction] = useActionState<SetPasswordState, FormData>(
    setPasswordAction,
    null,
  );
  const errorMessage = state && state.kind === "error" ? state.message : null;

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <Field label={a.newPassword} hint={a.minChars}>
        <Input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </Field>
      <Field label={a.confirmPassword}>
        <Input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </Field>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { t } = useApp();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full justify-center" disabled={pending}>
      {pending ? (
        <>
          <Spinner size="sm" solid /> {t.auth.saving}
        </>
      ) : (
        t.auth.savePassword
      )}
    </Button>
  );
}
