import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Recuperar contraseña · SaludCoNet" };

export default function RecuperarPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-mesh-light">
      <div className="bg-dotgrid absolute inset-0 opacity-50" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center px-5 py-12 md:px-8">
        <div className="w-full max-w-md rounded-3xl border border-mist-200 bg-white p-8 shadow-[var(--shadow-card)] md:p-10">
          <Logo />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink-900 md:text-3xl">
            Recupera tu contraseña
          </h1>
          <p className="mt-2 text-sm text-mist-500">Te enviaremos un email con un enlace seguro para restablecerla.</p>
          <form className="mt-8 space-y-4">
            <Field label="Email"><Input type="email" placeholder="tu@email.com" required /></Field>
            <Button size="lg" className="w-full justify-center">Enviar enlace de recuperación</Button>
          </form>
          <p className="mt-8 text-center text-sm text-mist-500">
            <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">← Volver a iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
