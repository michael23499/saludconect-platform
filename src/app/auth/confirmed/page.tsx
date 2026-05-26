import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@backend/auth/get-user";
import { dashboardPathForRole } from "@backend/auth/paths";
import { getDict } from "@/lib/i18n-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const a = (await getDict()).auth;
  return { title: `${a.confirmedTitle} · SaludCoNet` };
}

/**
 * Pantalla de bienvenida tras verificar el correo (llega desde /auth/confirm
 * con type=signup). verifyOtp ya dejó la sesión activa, así que el CTA lleva
 * directamente al panel; su texto se adapta al estado real del usuario para que
 * tenga sentido (panel / completar perfil / iniciar sesión).
 */
export default async function ConfirmedPage() {
  const current = await getCurrentUser();
  const a = (await getDict()).auth;

  let href = "/login";
  let cta = a.confirmedGoLogin;
  if (current?.profile) {
    href = dashboardPathForRole(current.profile.role);
    cta = a.confirmedGoPanel;
  } else if (current) {
    href = "/complete-profile";
    cta = a.confirmedCompleteProfile;
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-mesh-light">
      <div className="bg-dotgrid absolute inset-0 opacity-50" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center px-5 py-12 md:px-8">
        <div className="w-full max-w-md rounded-3xl border border-mist-200 bg-white p-8 text-center shadow-[var(--shadow-card)] md:p-10">
          <div className="flex justify-center">
            <Logo />
          </div>

          <span className="scale-in mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink-900">{a.confirmedTitle}</h1>
          <p className="mt-2 text-[15px] text-mist-500">{a.confirmedSubtitle}</p>

          <Button href={href} size="lg" className="mt-8 w-full justify-center">
            {cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
