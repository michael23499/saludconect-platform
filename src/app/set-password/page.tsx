import { requireSession } from "@backend/auth/guards";
import { SetPasswordForm } from "./SetPasswordForm";
import { Logo } from "@/components/ui/Logo";
import { AuthHeading } from "@/components/auth/AuthHeading";

export const metadata = { title: "Establecer contraseña · SaludCoNet" };

export default async function EstablecerPasswordPage() {
  const current = await requireSession();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-mesh-light">
      <div className="bg-dotgrid absolute inset-0 opacity-50" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center px-5 py-12 md:px-8">
        <div className="w-full max-w-md rounded-3xl border border-mist-200 bg-white p-8 shadow-[var(--shadow-card)] md:p-10">
          <Logo />
          <AuthHeading titleKey="setTitle" email={current.auth.email ?? ""} />
          <SetPasswordForm />
        </div>
      </div>
    </div>
  );
}
