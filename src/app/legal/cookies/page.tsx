import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).legal.cookies;
  return { title: t.metaTitle };
}

export default async function CookiesPage() {
  const t = (await getDict()).legal.cookies;
  return (
    <LegalLayout title={t.title} updated={t.updated}>
      <h2>{t.s1h}</h2>
      <p>{t.s1p}</p>
      <h2>{t.s2h}</h2>
      <ul>
        <li><strong>{t.s2item1Strong}</strong>{t.s2item1}</li>
        <li><strong>{t.s2item2Strong}</strong>{t.s2item2}</li>
        <li><strong>{t.s2item3Strong}</strong>{t.s2item3}</li>
      </ul>
      <h2>{t.s3h}</h2>
      <p>{t.s3p}</p>
    </LegalLayout>
  );
}
