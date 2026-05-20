import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Field, Input, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Iniciar sesión · SaludCoNet" };

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-mesh-light">
      <div className="bg-dotgrid absolute inset-0 opacity-50" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center px-5 py-12 md:px-8">
        <div className="w-full max-w-md rounded-3xl border border-mist-200 bg-white p-8 shadow-[var(--shadow-card)] md:p-10">
          <Logo />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink-900 md:text-3xl">
            Bienvenido de vuelta
          </h1>
          <p className="mt-2 text-sm text-mist-500">Accede a tu panel para gestionar reservas, calendario y mensajes.</p>

          <form className="mt-8 space-y-4">
            <Field label="Email"><Input type="email" placeholder="tu@email.com" required /></Field>
            <Field
              label="Contraseña"
              hint=""
            >
              <Input type="password" placeholder="Tu contraseña" required />
            </Field>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-ink-800">
                <Checkbox /> Recordarme
              </label>
              <Link href="/recuperar" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                Olvidé mi contraseña
              </Link>
            </div>
            <Button size="lg" className="w-full justify-center">Iniciar sesión</Button>
          </form>

          <div className="mt-7 flex items-center gap-3 text-xs text-mist-400">
            <span className="h-px flex-1 bg-mist-200" />
            o continúa con
            <span className="h-px flex-1 bg-mist-200" />
          </div>
          <button className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-mist-200 bg-white text-sm font-medium text-ink-800 hover:bg-mist-50">
            <svg className="h-[18px] w-[18px]" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3.1 0 5.9 1.2 8 3.1l5.7-5.7A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.2-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13-5l-6-5.2c-2 1.4-4.5 2.2-7 2.2-5.2 0-9.6-3.3-11.2-8L6.3 33.1A20 20 0 0 0 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6 5.2c-.4.4 6.7-4.9 6.7-14.7 0-1.2-.1-2.3-.3-3.5z" />
            </svg>
            Continuar con Google
          </button>

          <p className="mt-8 text-center text-sm text-mist-500">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold text-brand-700 hover:text-brand-800">
              Crea una gratis
            </Link>
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-dashed border-mist-200 bg-mist-50/60 p-3 text-center text-[11px] text-mist-500">
            <Link href="/dashboard/profesional" className="hover:text-brand-700">
              <div className="font-semibold text-ink-800">Demo</div>Profesional
            </Link>
            <Link href="/dashboard/clinica" className="hover:text-brand-700">
              <div className="font-semibold text-ink-800">Demo</div>Clínica
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
