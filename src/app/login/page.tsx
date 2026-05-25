import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { AuthNoAccount } from "@/components/auth/AuthLinks";
import { requireGuest } from "@backend/auth/guards";
import { getDict } from "@/lib/i18n-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).meta.login;
  return { title: t.title };
}

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
        </div>
      </div>
    </div>
  );
}
