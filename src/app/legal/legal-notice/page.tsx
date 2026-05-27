import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalBody } from "@/components/legal/LegalBody";
import { getDict, getLang } from "@/lib/i18n-server";
import { getSiteContent } from "@backend/queries/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).legal.notice;
  return { title: t.metaTitle };
}

export default async function AvisoPage() {
  const t = (await getDict()).legal.notice;
  const override = await getSiteContent("legal-notice", await getLang());
  if (override) {
    const hasTitle = override.trim().startsWith("# ");
    return (
      <LegalLayout title={hasTitle ? undefined : t.title}>
        <LegalBody text={override} />
      </LegalLayout>
    );
  }
  return (
    <LegalLayout title={t.title}>
      <h2>{t.s1h}</h2>
      <p>{t.s1pPre}<a href="mailto:hola@saludconet.demo">hola@saludconet.demo</a>{t.s1pPost}</p>

      <h2>{t.s2h}</h2>
      <p>{t.s2p}</p>

      <h2>{t.s3h}</h2>
      <p>{t.s3p}</p>

      <h2>{t.s4h}</h2>
      <p>{t.s4p}</p>

      <h2>{t.s5h}</h2>
      <p>{t.s5p}</p>

      <h2>{t.s6h}</h2>
      <p>{t.s6p}</p>
    </LegalLayout>
  );
}
