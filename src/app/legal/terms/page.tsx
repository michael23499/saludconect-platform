import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).legal.terms;
  return { title: t.metaTitle };
}

export default async function TerminosPage() {
  const t = (await getDict()).legal.terms;
  return (
    <LegalLayout title={t.title} updated={t.updated}>
      <h2>{t.s1h}</h2>
      <p>{t.s1p}</p>

      <h2>{t.s2h}</h2>
      <p>{t.s2p}</p>

      <h2>{t.s3h}</h2>
      <p>{t.s3p}</p>

      <h2>{t.s4h}</h2>
      <p>{t.s4p}</p>

      <h2>{t.s5h}</h2>
      <p>{t.s5p}</p>

      <h2>{t.s6h}</h2>
      <ul>
        {t.s6items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{t.s7h}</h2>
      <p>{t.s7p}</p>

      <h2>{t.s8h}</h2>
      <p>{t.s8p}</p>
    </LegalLayout>
  );
}
