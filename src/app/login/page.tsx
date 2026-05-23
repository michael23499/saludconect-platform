import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { AuthNoAccount } from "@/components/auth/AuthLinks";
import { requireGuest } from "@backend/auth/guards";

export const metadata = { title: "Iniciar sesión · SaludCoNet" };

export default async function LoginPage() {
  await requireGuest();
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-mesh-light">
      <div className="bg-dotgrid absolute inset-0 opacity-50" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center px-5 py-12 md:px-8">
        <div className="w-full max-w-md rounded-3xl border border-mist-200 bg-white p-8 shadow-[var(--shadow-card)] md:p-10">
          <Logo />
          <AuthHeading titleKey="loginTitle" subtitleKey="loginSubtitle" />

          <LoginForm />

          <AuthNoAccount />
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-dashed border-mist-200 bg-mist-50/60 p-3 text-center text-[11px] text-mist-500">
            <Link href="/dashboard/professional" className="hover:text-brand-700">
              <div className="font-semibold text-ink-800">Demo</div>Profesional
            </Link>
            <Link href="/dashboard/clinic" className="hover:text-brand-700">
              <div className="font-semibold text-ink-800">Demo</div>Clínica
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
