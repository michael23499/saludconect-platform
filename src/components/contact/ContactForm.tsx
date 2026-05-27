"use client";

import { useState, useTransition } from "react";
import { useApp } from "@/components/providers/Providers";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { cn } from "@/lib/cn";
import { sendContactMessageAction } from "@backend/actions/contact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = { name?: string; email?: string; message?: string };

export function ContactForm() {
  const t = useApp().t.pages.contact;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function reset() {
    setName("");
    setEmail("");
    setCompany("");
    setSubject("");
    setMessage("");
    setConsent(false);
    setErrors({});
    setFormError(null);
    setSent(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    // Validación por campo: el error se muestra bajo el campo correspondiente.
    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = t.fieldRequired;
    if (!EMAIL_RE.test(email.trim())) next.email = email.trim() ? t.errorEmail : t.fieldRequired;
    if (message.trim().length < 1) next.message = t.fieldRequired;
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    startTransition(async () => {
      const res = await sendContactMessageAction({
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      if ("ok" in res) {
        setSent(true);
      } else if (res.error === "email") {
        setErrors({ email: t.errorEmail });
      } else if (res.error === "email_undeliverable") {
        setErrors({ email: t.errorEmailUndeliverable });
      } else {
        setFormError(t.errorRequired);
      }
    });
  }

  if (sent) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-mist-200 bg-white p-8 text-center md:p-10">
        <svg className="h-8 w-8 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12.5l5 5L20 6.5" />
        </svg>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-ink-900">{t.successTitle}</h2>
        <p className="mt-1.5 max-w-xs text-sm text-mist-500">{t.successDesc}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
        >
          {t.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-mist-200 bg-white p-7 shadow-[var(--shadow-card)] md:p-10"
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">{t.formEyebrow}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight text-ink-900">{t.formHeading}</div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label={t.fieldName} error={errors.name}>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            placeholder={t.fieldNamePlaceholder}
          />
        </Field>
        <Field label={t.fieldEmail} error={errors.email}>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder={t.fieldEmailPlaceholder}
          />
        </Field>
        <Field label={t.fieldCompany} className="md:col-span-2">
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t.fieldCompanyPlaceholder} />
        </Field>
        <Field label={t.fieldSubject} className="md:col-span-2">
          <SelectMenu
            value={subject}
            onChange={setSubject}
            placeholder={t.subjectPlaceholder}
            options={t.subjectOptions}
            ariaLabel={t.fieldSubject}
          />
        </Field>
        <Field label={t.fieldMessage} className="md:col-span-2" error={errors.message}>
          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((p) => ({ ...p, message: undefined }));
            }}
            placeholder={t.fieldMessagePlaceholder}
          />
        </Field>
      </div>
      <AnimatedCheckbox className="mt-5" checked={consent} onCheckedChange={setConsent}>
        {t.consentPre}
        <a href="/legal/privacy" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          {t.consentLink}
        </a>
        {t.consentSuf}
      </AnimatedCheckbox>

      {formError && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !consent}
        className={cn(
          "mt-5 inline-flex h-13 w-full select-none items-center justify-center rounded-full px-7 text-base font-medium transition-all",
          "disabled:pointer-events-none disabled:opacity-50",
          // Claro: navy de marca con leve realce.
          "bg-brand-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] hover:bg-brand-700 hover:shadow-[0_14px_30px_-10px_rgba(37,99,235,0.7)]",
          // Oscuro: minimalista — plano, sin glow ni sombra.
          "dark:bg-brand-600 dark:shadow-none dark:hover:bg-brand-500 dark:hover:shadow-none",
        )}
      >
        {pending ? t.sending : t.submit}
      </button>
    </form>
  );
}
