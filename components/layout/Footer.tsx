import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLS = [
  {
    title: "Producto",
    links: [
      { href: "/como-funciona", label: "Cómo funciona" },
      { href: "/clinicas", label: "Para clínicas" },
      { href: "/profesionales", label: "Para profesionales" },
      { href: "/buscar", label: "Buscar talento" },
      { href: "/precios", label: "Planes y precios" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { href: "/dashboard/profesional", label: "Área del profesional" },
      { href: "/dashboard/clinica", label: "Área de la clínica" },
      { href: "/admin", label: "Panel de administración" },
      { href: "/registro", label: "Registro" },
      { href: "/login", label: "Iniciar sesión" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { href: "/contacto", label: "Contacto" },
      { href: "/legal/privacidad", label: "Política de privacidad" },
      { href: "/legal/aviso", label: "Aviso legal" },
      { href: "/legal/terminos", label: "Términos y condiciones" },
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
              La nueva red profesional sanitaria. Conectamos clínicas privadas con profesionales sanitarios verificados en toda España.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { key: "linkedin", href: "#" },
                { key: "twitter", href: "#" },
                { key: "instagram", href: "https://www.instagram.com/clinicacapilarcastellana/" },
              ].map(({ key: s, href }) => (
                <a
                  key={s}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={s}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-200 bg-white text-ink-700 transition hover:border-brand-300 hover:text-brand-600"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    {s === "linkedin" && (
                      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                    )}
                    {s === "twitter" && (
                      <path d="M18.244 2H21l-6.546 7.486L22 22h-6.062l-4.74-6.21L5.7 22H3l7.02-8.03L2 2h6.21l4.29 5.66L18.244 2zm-1.06 18h1.68L7.93 4H6.15l11.034 16z" />
                    )}
                    {s === "instagram" && (
                      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13a5.9 5.9 0 0 0 2.12 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.12A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.84a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
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
