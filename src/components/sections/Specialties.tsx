import { Section, SectionHeading } from "@/components/ui/Section";
import { getDict } from "@/lib/i18n-server";

const SPEC_META = [
  { count: 112, icon: "✣" },
  { count: 142, icon: "❤" },
  { count: 218, icon: "★" },
  { count: 384, icon: "◐" },
  { count: 521, icon: "◆" },
  { count: 296, icon: "◉" },
  { count: 174, icon: "✦" },
  { count: 1042, icon: "✚" },
  { count: 158, icon: "◇" },
  { count: 132, icon: "▲" },
  { count: 96, icon: "◎" },
  { count: 78, icon: "◑" },
];

export async function Specialties() {
  const t = (await getDict()).sections.specialties;
  const SPECS = SPEC_META.map((m, i) => ({ ...m, name: t.names[i] }));
  return (
    <Section className="bg-mist-50">
      <SectionHeading
        eyebrow={t.eyebrow}
        title={<>{t.title1}<span className="text-gradient-brand">{t.title2}</span></>}
        description={t.desc}
      />
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SPECS.map((s, i) => (
          <a
            key={s.name}
            href={`/search?especialidad=${encodeURIComponent(s.name)}`}
            className="fade-up card-hover group flex items-center justify-between gap-3 rounded-2xl border border-mist-200 bg-white p-4 pl-5 hover:border-brand-300"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-700">
                {s.icon}
              </span>
              <div>
                <div className="text-[15px] font-semibold text-ink-900">{s.name}</div>
                <div className="text-xs text-mist-500">{s.count} {t.prosWord}</div>
              </div>
            </div>
            <svg className="h-4 w-4 -translate-x-1 text-mist-400 opacity-0 transition group-hover:translate-x-0 group-hover:text-brand-600 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        ))}
      </div>
    </Section>
  );
}
