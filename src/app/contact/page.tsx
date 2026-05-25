import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Contacto · SaludCoNet" };

export default function ContactoPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-mesh-light">
        <div className="bg-dotgrid absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-20">
          <div>
            <Badge tone="brand">Contacto</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink-900 md:text-5xl">
              Hablemos. <span className="text-gradient-brand">Te respondemos en 12 h.</span>
            </h1>
            <p className="mt-5 max-w-md text-mist-500 md:text-lg">
              ¿Eres una clínica que quiere optimizar contratación? ¿Un profesional con dudas sobre tu perfil? ¿Quieres formar parte de la lista de espera? Escríbenos.
            </p>
            <ul className="mt-10 space-y-5 text-sm">
              {[
                {
                  i: "✉",
                  t: "info@saludconet.com",
                  s: "Atención y consultas",
                  href: "mailto:info@saludconet.com",
                },
                {
                  i: "◍",
                  t: "app.saludconet.com",
                  s: "Visita nuestra web",
                  href: "https://app.saludconet.com",
                },
              ].map((c) => (
                <li key={c.t} className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-700">{c.i}</span>
                  <div>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="font-semibold text-ink-900 transition hover:text-brand-700"
                    >
                      {c.t}
                    </a>
                    <div className="text-mist-500">{c.s}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <form className="rounded-3xl border border-mist-200 bg-white p-7 shadow-[var(--shadow-card)] md:p-10">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">Formulario de contacto</div>
            <div className="mt-1 text-xl font-semibold tracking-tight text-ink-900">Cuéntanos en qué te ayudamos</div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Nombre completo"><Input placeholder="Tu nombre" required /></Field>
              <Field label="Email"><Input type="email" placeholder="tu@email.com" required /></Field>
              <Field label="Empresa / Clínica" className="md:col-span-2"><Input placeholder="Opcional" /></Field>
              <Field label="¿En qué te ayudamos?" className="md:col-span-2">
                <SelectMenu
                  name="asunto"
                  placeholder="Selecciona el motivo de tu mensaje…"
                  options={[
                    "Soy una clínica interesada",
                    "Soy un profesional sanitario",
                    "Solicito información sobre planes",
                    "Quiero apuntarme a la lista de espera",
                    "Soporte técnico",
                    "Prensa y partners",
                  ]}
                />
              </Field>
              <Field label="Mensaje" className="md:col-span-2">
                <Textarea placeholder="Cuéntanos brevemente cómo podemos ayudarte" />
              </Field>
            </div>
            <AnimatedCheckbox className="mt-5" name="privacy" required>
              Acepto la{" "}
              <a href="/legal/privacy" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
                política de privacidad
              </a>{" "}
              y el tratamiento de datos
            </AnimatedCheckbox>
            <Button size="lg" className="mt-5 w-full justify-center">Enviar mensaje</Button>
          </form>
        </div>
      </section>

      <Section className="bg-white">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "Para clínicas", d: "Reserva una demo personalizada con nuestro equipo comercial.", href: "/clinics" },
            { t: "Para profesionales", d: "Resuelve dudas sobre verificación, tarifas o calendario.", href: "/professionals" },
            { t: "Lista de espera", d: "Apúntate y te avisamos cuando llegue talento en tu ciudad o especialidad.", href: "#" },
          ].map((b) => (
            <a key={b.t} href={b.href} className="card-hover group block rounded-2xl border border-mist-200 bg-mist-50/40 p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">{b.t}</div>
              <div className="mt-1 text-[17px] font-semibold tracking-tight text-ink-900">{b.d}</div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                Ir a la sección
                <svg className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </div>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
