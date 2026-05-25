import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).legal.privacy;
  return { title: t.metaTitle };
}

export default async function PrivacidadPage() {
  const t = (await getDict()).legal.privacy;
  return (
    <LegalLayout
      title={t.title}
      updated={t.updated}
      intro={t.intro}
    >
      <h2>{t.s1h}</h2>
      <p>{t.s1pPre}<a href="mailto:dpd@saludconet.demo">dpd@saludconet.demo</a>{t.s1pPost}</p>

      <h2>{t.s2h}</h2>
      <p>{t.s2p}</p>
      <ul>
        {t.s2items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{t.s3h}</h2>
      <ul>
        {t.s3items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{t.s4h}</h2>
      <p>{t.s4p}</p>

      <h2>{t.s5h}</h2>
      <p>{t.s5p}</p>

      <h2>{t.s6h}</h2>
      <p>{t.s6p}</p>

      <h2>{t.s7h}</h2>
      <p>{t.s7pPre}<a href="mailto:dpd@saludconet.demo">dpd@saludconet.demo</a>{t.s7pPost}</p>

      <h2>{t.s8h}</h2>
      <p>{t.s8p}</p>
    </LegalLayout>
  );
}
