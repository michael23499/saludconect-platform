import Link from "next/link";
import { RegisterShell } from "@/components/register/RegisterShell";
import { RegisterClinicForm, RegisterProfessionalForm } from "@/components/register/RegisterForms";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { requireGuest } from "@backend/auth/guards";
import { getDict } from "@/lib/i18n-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).meta.register;
  return { title: t.title };
}

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
        formClinica={<RegisterClinicForm />}
        formProfesional={<RegisterProfessionalForm />}
        emptyState={
          <div className="mt-8 rounded-2xl border border-dashed border-mist-300 bg-mist-50/60 p-8 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-4 text-[15px] font-medium text-ink-900">{r.emptyTitle}</p>
          </div>
        }
        footer={
          <>
            <div className="mt-8 flex items-center gap-3 text-xs text-mist-400">
              <span className="h-px flex-1 bg-mist-200" />
              {r.orWith}
              <span className="h-px flex-1 bg-mist-200" />
            </div>
            <GoogleSignInButton />
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
