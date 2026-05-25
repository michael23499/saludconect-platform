import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Field, Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { Button } from "@/components/ui/Button";
import { RegisterShell } from "@/components/register/RegisterShell";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { requireGuest } from "@backend/auth/guards";
import { getDict } from "@/lib/i18n-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).meta.register;
  return { title: t.title };
}

type RegisterDict = Awaited<ReturnType<typeof getDict>>["register"];

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  await requireGuest();
  const sp = await searchParams;
  const rol = sp?.rol === "professional" ? "professional" : sp?.rol === "clinic" ? "clinic" : null;
  const r = (await getDict()).register;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-mesh-light">
      <div className="bg-dotgrid absolute inset-0 opacity-50" />
      <RegisterShell
        initialRole={rol}
        formClinica={<FormClinica r={r} />}
        formProfesional={<FormProfesional r={r} />}
        emptyState={
          <div className="mt-8 rounded-2xl border border-dashed border-mist-300 bg-mist-50/60 p-8 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-4 text-[15px] font-medium text-ink-900">{r.emptyTitle}</p>
            <p className="mt-1 text-sm text-mist-500">{r.emptyHint}</p>
          </div>
        }
        footer={
          <>
            <div className="mt-8 flex items-center gap-3 text-xs text-mist-400">
              <span className="h-px flex-1 bg-mist-200" />
              {r.orWith}
              <span className="h-px flex-1 bg-mist-200" />
            </div>
            <GoogleSignInButton next="/" />
            <p className="mt-6 text-center text-xs text-mist-500">
              {r.termsPre}
              <Link className="underline" href="/legal/terms">{r.termsLink}</Link>
              {r.termsMid}
              <Link className="underline" href="/legal/privacy">{r.privacyLink}</Link>
              {r.termsSuf}
            </p>
          </>
        }
      />
    </div>
  );
}

function FormClinica({ r }: { r: RegisterDict }) {
  return (
    <form className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Badge tone="brand">{r.cfBadge}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={r.cfName}><Input placeholder="Clínica Mediterránea" /></Field>
        <Field label={r.cfContact}><Input placeholder="Marta Vives" /></Field>
        <Field label={r.cfCity}><Input placeholder="Madrid" /></Field>
        <Field label={r.cfAddress}><Input placeholder="Calle Alcalá 200" /></Field>
        <Field label={r.cfEmail}><Input type="email" placeholder="info@clinica.com" /></Field>
        <Field label={r.cfPhone}><Input type="tel" placeholder="+34 600 00 00 00" /></Field>
        <Field label={r.cfSpecialty}>
          <SelectMenu name="especialidad" options={r.specialties} placeholder={r.selectPlaceholder} />
        </Field>
        <Field label={r.cfTeam}>
          <SelectMenu name="tamano" placeholder={r.selectPlaceholder} options={r.teamSizes} />
        </Field>
        <Field label={r.cfPassword} className="md:col-span-2"><PasswordInput placeholder={r.passwordPlaceholder} /></Field>
      </div>
      <AnimatedCheckbox name="trial" className="mt-1">
        {r.cfTrial1}
        <strong>{r.cfTrialDays}</strong>
        {r.cfTrial2}
        <strong>{r.cfTrialPlan}</strong>
        {r.cfTrial3}
      </AnimatedCheckbox>
      <Button size="lg" className="mt-1 w-full justify-center !shadow-[0_2px_10px_-3px_rgba(5,47,89,0.28)] hover:!shadow-[0_5px_16px_-5px_rgba(5,47,89,0.4)]">
        {r.cfSubmit}
      </Button>
    </form>
  );
}

function FormProfesional({ r }: { r: RegisterDict }) {
  return (
    <form className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Badge tone="brand">{r.pfBadge}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={r.pfFirstName}><Input placeholder="Lucía" /></Field>
        <Field label={r.pfLastName}><Input placeholder="Martín García" /></Field>
        <Field label={r.pfProfession}>
          <SelectMenu name="profesion" options={r.professions} placeholder={r.selectPlaceholder} />
        </Field>
        <Field label={r.pfSpecialty}>
          <SelectMenu name="especialidad" options={r.specialties} placeholder={r.selectPlaceholder} />
        </Field>
        <Field label={r.pfCity}><Input placeholder="Madrid" /></Field>
        <Field label={r.pfPhone}><Input type="tel" placeholder="+34 600 00 00 00" /></Field>
        <Field label={r.pfEmail} className="md:col-span-2"><Input type="email" placeholder="tu@email.com" /></Field>
        <Field label={r.pfPassword} className="md:col-span-2"><PasswordInput placeholder={r.passwordPlaceholder} /></Field>
      </div>
      <AnimatedCheckbox name="docs_consent" required className="mt-1">
        {r.pfConsent}
      </AnimatedCheckbox>
      <Button size="lg" className="mt-1 w-full justify-center !shadow-[0_2px_10px_-3px_rgba(5,47,89,0.28)] hover:!shadow-[0_5px_16px_-5px_rgba(5,47,89,0.4)]">
        {r.pfSubmit}
      </Button>
    </form>
  );
}
