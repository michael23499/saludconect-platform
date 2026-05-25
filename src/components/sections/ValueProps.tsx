import { Section, SectionHeading } from "@/components/ui/Section";
import { getDict } from "@/lib/i18n-server";

const ICONS = {
  bolt: (
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" strokeLinejoin="round" strokeLinecap="round" />
  ),
  shield: (
    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" strokeLinejoin="round" strokeLinecap="round" />
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </>
  ),
  chat: (
    <path d="M21 12c0 4.4-4 8-9 8-1.4 0-2.7-.2-3.9-.7L3 21l1.7-4.6C3.6 15 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" strokeLinejoin="round" />
  ),
  card: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19M6 15h4" strokeLinecap="round" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" strokeLinejoin="round" />
      <path d="M14 3v5h5M9 13h6M9 17h6" strokeLinecap="round" />
    </>
  ),
};

const ICON_LIST = [ICONS.bolt, ICONS.shield, ICONS.calendar, ICONS.chat, ICONS.card, ICONS.doc];
const TONES = [
  "from-brand-500 to-cyan-400",
  "from-ink-800 to-brand-700",
  "from-brand-600 to-brand-400",
  "from-cyan-500 to-brand-500",
  "from-indigo-600 to-brand-500",
  "from-brand-700 to-cyan-500",
];

export async function ValueProps() {
  const t = (await getDict()).sections;
  const FEATURES = t.value.features.map((f, i) => ({
    icon: ICON_LIST[i],
    title: f.title,
    desc: f.desc,
    tone: TONES[i],
  }));
  return (
    <Section className="bg-mesh-light">
      <SectionHeading
        eyebrow={t.value.eyebrow}
        title={
          <>
            {t.value.title1}<span className="text-gradient-brand">{t.value.title2}</span>
            <br />
            {t.value.title3}
          </>
        }
        description={t.value.desc}
      />
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="card-hover group relative overflow-hidden rounded-2xl border border-mist-200 bg-white p-7"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-[0.07] blur-2xl transition group-hover:opacity-15 from-brand-500 to-cyan-400" />
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_10px_24px_-8px_rgba(37,99,235,0.45)] ${f.tone}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
                {f.icon}
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink-900">{f.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-mist-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
