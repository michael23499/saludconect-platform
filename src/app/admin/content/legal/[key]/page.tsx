import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/Shell";
import { SingleLegalEditor, type LegalDoc } from "@/components/admin/SingleLegalEditor";
import { getDict } from "@/lib/i18n-server";
import { DICT, type Dict } from "@/lib/i18n";
import { defaultLegalText, legalTitle } from "@/lib/legal-defaults";
import { getSiteContent, LEGAL_CONTENT } from "@backend/queries/site-content";

export const metadata = { title: "Editar contenido · SaludCoNet" };

export default async function EditLegalDocPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const entry = LEGAL_CONTENT.find((c) => c.key === key);
  if (!entry) notFound();

  const dict = await getDict();
  const a = dict.adminContent;

  // Siembra cada idioma con el override guardado (asegurando que tenga título) o,
  // si no hay, con el texto actual por defecto (que ya incluye el título H1).
  const seed = async (lang: "es" | "en", d: Dict): Promise<string> => {
    const s = await getSiteContent(key, lang);
    if (s == null) return defaultLegalText(key, d);
    const trimmed = s.trim();
    return trimmed.startsWith("# ") ? trimmed : `# ${legalTitle(key, d)}\n\n${trimmed}`;
  };

  const doc: LegalDoc = {
    key,
    label: legalTitle(key, dict),
    href: entry.path,
    es: await seed("es", DICT.es),
    en: await seed("en", DICT.en),
  };

  return (
    <>
      <PageHeader title={doc.label} backHref="/admin/content/legal" backLabel={a.legalSegment} />
      <SingleLegalEditor doc={doc} />
    </>
  );
}
