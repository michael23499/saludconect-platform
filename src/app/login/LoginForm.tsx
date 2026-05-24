"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Field, Input, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useApp } from "@/components/providers/Providers";
import {
  signInWithPasswordAction,
  type SignInState,
} from "@backend/auth/sign-in";
import {
  requestPasswordSetupLink,
  type SetupPasswordRequestState,
} from "@backend/auth/setup-password";
import { precheckEmailAction } from "@backend/auth/precheck";

type DetectedOAuth = { email: string; providers: string[] };

export function LoginForm() {
  const { t } = useApp();
  const a = t.auth;
  const [state, formAction] = useActionState<SignInState, FormData>(
    signInWithPasswordAction,
    null,
  );

  const [detected, setDetected] = useState<DetectedOAuth | null>(null);

  const oauth: DetectedOAuth | null =
    detected ??
    (state && state.kind === "oauth-only"
      ? { email: state.email, providers: state.providers }
      : null);

  if (oauth) {
    return (
      <OAuthOnlyView
        email={oauth.email}
        providers={oauth.providers}
        onBack={() => setDetected(null)}
      />
    );
  }

  const errorMessage = state && state.kind === "error" ? state.message : null;

  return (
    <>
      <form action={formAction} className="mt-8 space-y-4">
        <EmailField onDetectOAuth={(email, providers) => setDetected({ email, providers })} />
        <Field label={a.password}>
          <Input
            name="password"
            type="password"
            placeholder={a.passwordPlaceholder}
            required
            autoComplete="current-password"
          />
        </Field>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <Checkbox /> {a.remember}
          </label>
          <Link href="/reset-password" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            {a.forgot}
          </Link>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <SubmitButton />
      </form>

      <div className="mt-7 flex items-center gap-3 text-xs text-mist-400">
        <span className="h-px flex-1 bg-mist-200" />
        {a.orContinueWith}
        <span className="h-px flex-1 bg-mist-200" />
      </div>
      <GoogleSignInButton />
    </>
  );
}

/* EmailField — input con precheck en onBlur */

function looksComplete(email: string): boolean {
  const e = email.trim();
  if (!e.includes("@")) return false;
  const [local, domain] = e.split("@");
  if (!local || !domain) return false;
  const lastDot = domain.lastIndexOf(".");
  if (lastDot < 1) return false;
  const tld = domain.slice(lastDot + 1);
  return tld.length >= 2;
}

const DEBOUNCE_MS = 600;
const FAST_TRIGGER_TLDS = [".com", ".es", ".org", ".net", ".io", ".dev", ".co", ".eu"];

function EmailField({
  onDetectOAuth,
}: {
  onDetectOAuth: (email: string, providers: string[]) => void;
}) {
  const { t } = useApp();
  const a = t.auth;
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hint, setHint] = useState<string | null>(null);
  const lastFiredRef = useRef<string | null>(null);

  useEffect(() => {
    const email = value.trim().toLowerCase();
    if (!looksComplete(email)) return;
    if (checked === email) return;
    if (lastFiredRef.current === email) return;

    const justFinishedTld = FAST_TRIGGER_TLDS.some((tld) => email.endsWith(tld));
    const delay = justFinishedTld ? 150 : DEBOUNCE_MS;

    const handle = setTimeout(() => {
      lastFiredRef.current = email;
      startTransition(async () => {
        const result = await precheckEmailAction(email);
        setChecked(email);
        if (result.kind === "oauth-only") {
          // Solo guiamos a las cuentas OAuth (usa Google). No mostramos nada
          // para "no encontrado" ni "tiene contraseña": privacidad primero, no
          // revelamos si el email está registrado.
          onDetectOAuth(email, result.providers);
        } else {
          setHint(null);
        }
      });
    }, delay);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Field label={a.email} hint={hint ?? undefined}>
      <div className="relative">
        <Input
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
          autoComplete="email"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (hint) setHint(null);
          }}
          className={isPending ? "pr-11 transition-[padding] duration-200" : "transition-[padding] duration-200"}
        />
        {isPending && (
          <span
            className="pointer-events-none absolute right-3.5 top-[calc(50%+1px)] -translate-y-1/2 animate-spinner-in"
            aria-hidden
          >
            <Spinner size="sm" />
          </span>
        )}
      </div>
    </Field>
  );
}

function SubmitButton() {
  const { t } = useApp();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full justify-center" disabled={pending}>
      {pending ? (
        <>
          <Spinner size="sm" solid /> {t.auth.signingIn}
        </>
      ) : (
        t.auth.signIn
      )}
    </Button>
  );
}

/* Vista para cuentas OAuth-only */

function OAuthOnlyView({
  email,
  providers,
  onBack,
}: {
  email: string;
  providers: string[];
  onBack: () => void;
}) {
  const { t } = useApp();
  const a = t.auth;
  const [view, setView] = useState<"choose" | "setting-up">("choose");

  if (view === "setting-up") {
    return <SetupPasswordView email={email} onBack={() => setView("choose")} />;
  }

  const hasGoogle = providers.includes("google");
  const providerName = hasGoogle ? "Google" : providers.join(", ");

  return (
    <div className="mt-8 space-y-5">
      <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white text-brand-700 ring-1 ring-brand-200">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">
              {a.oauthUsesProvider} {providerName}
            </p>
            <p className="mt-1 text-[13px] text-mist-600">
              <span className="font-medium text-ink-800">{email}</span> {a.oauthRegisteredWith}{" "}
              {providerName} {a.oauthDesc}
            </p>
          </div>
        </div>
      </div>

      {hasGoogle && <GoogleSignInButton />}

      <div className="flex items-center gap-3 text-xs text-mist-400">
        <span className="h-px flex-1 bg-mist-200" />
        o
        <span className="h-px flex-1 bg-mist-200" />
      </div>

      <Button
        variant="secondary"
        size="lg"
        className="w-full justify-center"
        onClick={() => setView("setting-up")}
      >
        {a.createPasswordForAccount}
      </Button>

      <BackLink onClick={onBack}>{a.useOtherEmail}</BackLink>
    </div>
  );
}

/* BackLink — botón "volver" con flecha animada */

function BackLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-mist-500 transition hover:bg-mist-50 hover:text-ink-800"
    >
      <svg
        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {children}
    </button>
  );
}

function SetupPasswordView({ email, onBack }: { email: string; onBack: () => void }) {
  const { t } = useApp();
  const a = t.auth;
  const [state, formAction] = useActionState<SetupPasswordRequestState, FormData>(
    requestPasswordSetupLink,
    null,
  );

  if (state && state.kind === "sent") {
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
            {a.setupSentPrefix} <span className="font-medium text-ink-800">{state.email}</span>.
            <br />
            {a.setupSentDesc}
          </p>
        </div>
        <BackLink onClick={onBack}>{a.back}</BackLink>
      </div>
    );
  }

  const errorMessage = state && state.kind === "error" ? state.message : null;

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <p className="text-[13px] text-mist-600">
        {a.setupSendPrefix} <span className="font-medium text-ink-800">{email}</span> {a.setupSendDesc}
      </p>
      <input type="hidden" name="email" value={email} />
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      <SendLinkButton />
      <BackLink onClick={onBack}>{a.back}</BackLink>
    </form>
  );
}

function SendLinkButton() {
  const { t } = useApp();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full justify-center" disabled={pending}>
      {pending ? (
        <>
          <Spinner size="sm" solid /> {t.auth.sendingLink}
        </>
      ) : (
        t.auth.sendLinkByEmail
      )}
    </Button>
  );
}
