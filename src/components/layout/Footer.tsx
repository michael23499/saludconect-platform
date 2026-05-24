import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLS = [
  {
    title: "Producto",
    links: [
      { href: "/how-it-works", label: "Cómo funciona" },
      { href: "/clinics", label: "Para clínicas" },
      { href: "/professionals", label: "Para profesionales" },
      { href: "/search", label: "Buscar talento" },
      { href: "/precios", label: "Planes y precios" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { href: "/dashboard/professional", label: "Área del profesional" },
      { href: "/dashboard/clinic", label: "Área de la clínica" },
      { href: "/admin", label: "Panel de administración" },
      { href: "/register", label: "Registro" },
      { href: "/login", label: "Iniciar sesión" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { href: "/contact", label: "Contacto" },
      { href: "/legal/privacy", label: "Política de privacidad" },
      { href: "/legal/legal-notice", label: "Aviso legal" },
      { href: "/legal/terms", label: "Términos y condiciones" },
      { href: "/legal/cookies", label: "Política de cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-mist-200 bg-mist-50">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_3fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-mist-500">
              La nueva red profesional sanitaria. Conectamos clínicas con profesionales sanitarios verificados en toda España.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-mist-500">
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <a href="https://maps.google.com/?q=Calle+Azahar+6,+28020+Madrid,+Spain" target="_blank" rel="noopener noreferrer" className="transition hover:text-brand-700">
                  Calle Azahar 6, 28020 Madrid
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href="tel:+34604890900" className="transition hover:text-brand-700">604 89 09 00</a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
                <a href="mailto:info@saludconet.com" className="transition hover:text-brand-700">
                  info@saludconet.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
                </svg>
                <a href="https://clinicacapilarcastellana.es" target="_blank" rel="noopener noreferrer" className="transition hover:text-brand-700">
                  clinicacapilarcastellana.es
                </a>
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              {[
                { key: "instagram", href: "https://www.instagram.com/clinicacapilarcastellana/", label: "Instagram" },
                { key: "whatsapp", href: "https://wa.me/34604890900", label: "WhatsApp" },
                { key: "phone", href: "tel:+34604890900", label: "Teléfono" },
                { key: "email", href: "mailto:info@saludconet.com", label: "Email" },
                { key: "web", href: "https://clinicacapilarcastellana.es", label: "Web" },
              ].map(({ key: s, href, label }) => (
                <a
                  key={s}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-200 bg-white text-ink-700 transition hover:border-brand-300 hover:text-brand-600"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    {s === "instagram" && (
                      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13a5.9 5.9 0 0 0 2.12 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.12A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.84a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                    )}
                    {s === "whatsapp" && (
                      <path d="M20.52 3.48A11.79 11.79 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.86c0 2.09.55 4.13 1.6 5.93L0 24l6.39-1.67a11.86 11.86 0 0 0 5.66 1.44h.01c6.55 0 11.87-5.32 11.87-11.86a11.78 11.78 0 0 0-3.41-8.43zM12.05 21.8h-.01a9.93 9.93 0 0 1-5.06-1.39l-.36-.21-3.79.99 1.01-3.69-.24-.38a9.91 9.91 0 0 1-1.52-5.26c0-5.46 4.45-9.9 9.92-9.9a9.85 9.85 0 0 1 7.02 2.91 9.85 9.85 0 0 1 2.9 7c0 5.46-4.45 9.93-9.91 9.93zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
                    )}
                    {s === "phone" && (
                      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.07 15.07 0 0 1-6.59-6.58l2.2-2.21a1 1 0 0 0 .25-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" />
                    )}
                    {s === "email" && (
                      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                    )}
                    {s === "web" && (
                      <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm7.93 9h-3.18a15.62 15.62 0 0 0-1.18-5.36A8.03 8.03 0 0 1 19.93 11zM12 4.07c.83 1.18 1.97 3.6 2.21 6.93H9.79C10.03 7.67 11.17 5.25 12 4.07zM4.07 13h3.18a15.62 15.62 0 0 0 1.18 5.36A8.03 8.03 0 0 1 4.07 13zm0-2a8.03 8.03 0 0 1 4.43-5.36A15.62 15.62 0 0 0 7.25 11H4.07zM12 19.93c-.83-1.18-1.97-3.6-2.21-6.93h4.42c-.24 3.33-1.38 5.75-2.21 6.93zm3.57-1.57A15.62 15.62 0 0 0 16.75 13h3.18a8.03 8.03 0 0 1-4.36 5.36z" />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {COLS.map((c) => (
              <div key={c.title}>
                <div className="text-sm font-semibold text-ink-900">{c.title}</div>
                <ul className="mt-3 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-mist-500 transition hover:text-brand-700">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-mist-200 pt-6 md:flex-row md:items-center">
          <p className="text-xs text-mist-500">
            © {new Date().getFullYear()} SaludCoNet · Plataforma sanitaria profesional · Hecho en España
          </p>
          <p className="text-xs text-mist-500">Demo construida para presentación de proyecto</p>
        </div>
      </div>
    </footer>
  );
}
