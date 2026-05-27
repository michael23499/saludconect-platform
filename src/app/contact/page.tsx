import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { ContactForm } from "@/components/contact/ContactForm";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).pages.contact;
  return { title: t.metaTitle, description: t.metaDescription };
}

const CONTACT_META = [
  { i: "✉", href: "mailto:info@saludconet.com" },
  { i: "☎", href: "tel:+34722310252" },
  { i: "◍", href: "https://app.saludconet.com" },
];

const CARD_HREFS = ["/clinics", "/professionals", "#"];

export default async function ContactoPage() {
  const t = (await getDict()).pages.contact;
  return (
    <>
      <section className="relative overflow-hidden bg-mesh-light">
        <div className="bg-dotgrid absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-20">
          <div>
            <Badge tone="brand">{t.badge}</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink-900 md:text-5xl">
              {t.heroTitlePre}<span className="text-gradient-brand">{t.heroTitleHi}</span>
            </h1>
            <p className="mt-5 max-w-md text-mist-500 md:text-lg">
              {t.heroDesc}
            </p>
            <ul className="mt-10 space-y-5 text-sm">
              {t.contactItems.map((c, idx) => {
                const meta = CONTACT_META[idx];
                return (
                  <li key={c.t} className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-700">{meta.i}</span>
                    <div>
                      <a
                        href={meta.href}
                        target={meta.href.startsWith("http") ? "_blank" : undefined}
                        rel={meta.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="font-semibold text-ink-900 transition hover:text-brand-700"
                      >
                        {c.t}
                      </a>
                      <div className="text-mist-500">{c.s}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <ContactForm />
        </div>
      </section>

      <Section className="bg-white">
        <div className="grid gap-4 md:grid-cols-3">
          {t.cards.map((b, idx) => (
            <a key={b.t} href={CARD_HREFS[idx]} className="card-hover group block rounded-2xl border border-mist-200 bg-mist-50/40 p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">{b.t}</div>
              <div className="mt-1 text-[17px] font-semibold tracking-tight text-ink-900">{b.d}</div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                {t.cardsGoTo}
                <svg className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </div>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
