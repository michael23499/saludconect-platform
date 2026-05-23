"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/components/providers/Providers";
import { completeProfileAction } from "@backend/actions/profile";

type Props = {
  defaultFullName: string;
  email: string;
};

export function CompleteProfileForm({ defaultFullName, email }: Props) {
  const { t } = useApp();
  const a = t.auth;
  const [role, setRole] = useState<"professional" | "clinic">("professional");

  return (
    <form action={completeProfileAction} className="mt-8 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-ink-900">{a.iAmA}</label>
        <div className="grid grid-cols-2 gap-2">
          <RoleTab
            label={a.roleProfessional}
            description={a.roleProfessionalDesc}
            selected={role === "professional"}
            onClick={() => setRole("professional")}
          />
          <RoleTab
            label={a.roleClinic}
            description={a.roleClinicDesc}
            selected={role === "clinic"}
            onClick={() => setRole("clinic")}
          />
        </div>
        <input type="hidden" name="role" value={role} />
      </div>

      <Field label={a.fullName}>
        <Input
          name="fullName"
          type="text"
          defaultValue={defaultFullName}
          placeholder={a.fullNamePlaceholder}
          required
          minLength={2}
        />
      </Field>

      <Field label={a.email} hint={a.emailReadonly}>
        <Input type="email" value={email} disabled readOnly />
      </Field>

      <Field label={a.phoneOptional}>
        <Input name="phone" type="tel" placeholder="+34 600 000 000" />
      </Field>

      <Field label={a.cityOptional}>
        <Input name="city" type="text" placeholder={a.cityPlaceholder} />
      </Field>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { t } = useApp();
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full justify-center"
      disabled={pending}
    >
      {pending ? (
        <>
          <Spinner size="sm" solid /> {t.auth.saving}
        </>
      ) : (
        t.auth.completeRegister
      )}
    </Button>
  );
}

function RoleTab({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-3 text-left transition",
        selected
          ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/20"
          : "border-mist-200 bg-white hover:border-mist-300",
      ].join(" ")}
    >
      <div className="text-sm font-semibold text-ink-900">{label}</div>
      <div className="mt-0.5 text-[11px] text-mist-500">{description}</div>
    </button>
  );
}
