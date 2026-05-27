import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalBody } from "@/components/legal/LegalBody";
import { getDict, getLang } from "@/lib/i18n-server";
import { getSiteContent } from "@backend/queries/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).legal.reservations;
  return { title: t.metaTitle };
}

export default async function ReservationsPolicyPage() {
  const t = (await getDict()).legal.reservations;
  const override = await getSiteContent("reservations", await getLang());
  if (override) {
    const hasTitle = override.trim().startsWith("# ");
    return (
      <LegalLayout title={hasTitle ? undefined : t.title}>
        <LegalBody text={override} />
      </LegalLayout>
    );
  }
  return (
    <LegalLayout title={t.title} intro={t.intro}>
      <h2>{t.s1h}</h2>
      <p>{t.s1p}</p>
      <p>{t.s1p2}</p>
      <p>{t.s1p3}</p>
      <p>{t.s1listIntro}</p>
      <ul>
        {t.s1items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{t.s2h}</h2>
      <p>{t.s2p}</p>
      <p>{t.s2listIntro}</p>
      <ul>
        {t.s2items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>{t.s2p2}</p>

      <h2>{t.s3h}</h2>
      <p>{t.s3p}</p>
      <p>{t.s3listIntro}</p>
      <ul>
        {t.s3items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>{t.s3p2}</p>
      <p>{t.s3p3}</p>

      <h2>{t.s4h}</h2>
      <p>{t.s4listIntro}</p>
      <ul>
        {t.s4items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>{t.s4p2}</p>

      <h2>{t.s5h}</h2>
      <p>{t.s5p}</p>

      <h2>{t.s6h}</h2>
      <p>{t.s6p}</p>
      <ul>
        {t.s6items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>{t.s6p2}</p>
    </LegalLayout>
  );
}
