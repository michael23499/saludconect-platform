import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import { Field, Input } from "@/components/ui/Input";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { Button } from "@/components/ui/Button";
import { RoleTabs } from "@/components/register/RoleTabs";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { requireGuest } from "@backend/auth/guards";

export const metadata = { title: "Crear cuenta · SaludCoNet" };

const PROFESIONES = [
  "Médico/a",
  "Enfermero/a",
  "Fisioterapeuta",
  "Odontólogo/a",
  "Psicólogo/a",
  "Dermatólogo/a",
  "Pediatra",
  "Cardiólogo/a",
  "Ginecólogo/a",
  "Auxiliar de enfermería",
];

const ESPECIALIDADES = [
  "Cardiología", "Pediatría", "Odontología", "Fisioterapia", "Psicología",
  "Dermatología", "Enfermería general", "Ginecología", "Traumatología",
  "Oftalmología", "Radiología", "Anestesia",
];

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  await requireGuest();
  const sp = await searchParams;
  const rol = sp?.rol === "professional" ? "professional" : sp?.rol === "clinic" ? "clinic" : null;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-mesh-light">
      <div className="bg-dotgrid absolute inset-0 opacity-50" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.05fr_1.4fr] md:px-8 md:py-16">
        <aside className="md:sticky md:top-24 md:self-start">
          <Logo />
          <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">
            Únete a la <span className="text-gradient-brand">nueva red sanitaria</span>.
          </h1>
          <p className="mt-4 text-mist-500">
            Más de 5.000 profesionales y 320 clínicas ya gestionan sus jornadas con SaludCoNet.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Inscripción rápida para acceder a la red",
              "Verificación documental en 24 h",
              "Cancela tu suscripción cuando quieras",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[15px] text-ink-800">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                  <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-mist-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              Inicia sesión
            </Link>
          </p>
        </aside>

        <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-[var(--shadow-card)] md:p-10">
          <RoleTabs
            initialRole={rol}
            emptyState={
              <div className="mt-8 rounded-2xl border border-dashed border-mist-300 bg-mist-50/60 p-8 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="mt-4 text-[15px] font-medium text-ink-900">¿Cómo te registras?</p>
                <p className="mt-1 text-sm text-mist-500">Elige arriba si eres una clínica o un profesional sanitario.</p>
              </div>
            }
            formClinica={<FormClinica />}
            formProfesional={<FormProfesional />}
          />

          <div className="mt-8 flex items-center gap-3 text-xs text-mist-400">
            <span className="h-px flex-1 bg-mist-200" />
            o regístrate con
            <span className="h-px flex-1 bg-mist-200" />
          </div>
          <GoogleSignInButton next="/" />
          <p className="mt-6 text-center text-xs text-mist-500">
            Al registrarte aceptas nuestros{" "}
            <Link className="underline" href="/legal/terms">Términos</Link> y la{" "}
            <Link className="underline" href="/legal/privacy">Política de privacidad</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function FormClinica() {
  return (
    <form className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Badge tone="brand">Registro de clínica</Badge>
        <span className="text-xs text-mist-500">Paso 1 de 2</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre de la clínica"><Input placeholder="Clínica Mediterránea" /></Field>
        <Field label="Persona de contacto"><Input placeholder="Marta Vives" /></Field>
        <Field label="Ciudad"><Input placeholder="Madrid" /></Field>
        <Field label="Dirección"><Input placeholder="Calle Alcalá 200" /></Field>
        <Field label="Email corporativo"><Input type="email" placeholder="info@clinica.com" /></Field>
        <Field label="Teléfono"><Input type="tel" placeholder="+34 600 00 00 00" /></Field>
        <Field label="Especialidad principal">
          <SelectMenu name="especialidad" options={ESPECIALIDADES} placeholder="Selecciona…" />
        </Field>
        <Field label="Tamaño de equipo">
          <SelectMenu
            name="tamano"
            placeholder="Selecciona…"
            options={["1 - 5 profesionales", "6 - 20 profesionales", "21 - 50 profesionales", "+50 profesionales"]}
          />
        </Field>
        <Field label="Contraseña" className="md:col-span-2"><Input type="password" placeholder="Mínimo 10 caracteres" /></Field>
      </div>
      <AnimatedCheckbox name="trial" className="mt-1">
        Quiero empezar mi prueba gratuita de <strong>14 días</strong> en el plan <strong>Clínica Pro</strong>
      </AnimatedCheckbox>
      <Button size="lg" className="w-full justify-center">Crear cuenta de clínica</Button>
    </form>
  );
}

function FormProfesional() {
  return (
    <form className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Badge tone="brand">Registro de profesional</Badge>
        <span className="text-xs text-mist-500">Paso 1 de 3 · Datos básicos</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre"><Input placeholder="Lucía" /></Field>
        <Field label="Apellidos"><Input placeholder="Martín García" /></Field>
        <Field label="Profesión">
          <SelectMenu name="profesion" options={PROFESIONES} placeholder="Selecciona…" />
        </Field>
        <Field label="Especialidad">
          <SelectMenu name="especialidad" options={ESPECIALIDADES} placeholder="Selecciona…" />
        </Field>
        <Field label="Ciudad"><Input placeholder="Madrid" /></Field>
        <Field label="Número de colegiado"><Input placeholder="28-049-381" /></Field>
        <Field label="Email"><Input type="email" placeholder="tu@email.com" /></Field>
        <Field label="Teléfono"><Input type="tel" placeholder="+34 600 00 00 00" /></Field>
        <Field label="Contraseña" className="md:col-span-2"><Input type="password" placeholder="Mínimo 10 caracteres" /></Field>
      </div>
      <AnimatedCheckbox name="docs_consent" required className="mt-1">
        Acepto que SaludCoNet valide mi documentación profesional
      </AnimatedCheckbox>
      <Button size="lg" className="w-full justify-center">Continuar — completar perfil</Button>
    </form>
  );
}
