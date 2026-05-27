import type { Dict } from "@/lib/i18n";

/** Título legible de un documento legal en el idioma dado (desde el i18n). */
export function legalTitle(key: string, d: Dict): string {
  const map: Record<string, string> = {
    cookies: d.legal.cookies.title,
    terms: d.legal.terms.title,
    privacy: d.legal.privacy.title,
    "legal-notice": d.legal.notice.title,
    reservations: d.legal.reservations.title,
  };
  return map[key] ?? key;
}

/**
 * Texto por defecto de cada página legal en el formato editable (## / - /
 * párrafos), construido desde el i18n. Sirve para SEMBRAR el editor del admin
 * cuando aún no hay override: así ve el contenido ACTUAL tal cual se publica y
 * lo edita encima, en vez de partir de cero. `d` es el diccionario del idioma.
 */
export function defaultLegalText(key: string, d: Dict): string {
  const L = d.legal;
  const blocks: string[] = [];
  const h = (s: string) => blocks.push(`## ${s}`);
  const p = (s: string) => blocks.push(s);
  const ul = (items: readonly string[]) => blocks.push(items.map((i) => `- ${i}`).join("\n"));

  // El título de la página (H1, "# ") va dentro del contenido editable también.
  const title = legalTitle(key, d);
  if (title) blocks.push(`# ${title}`);

  switch (key) {
    case "cookies": {
      const c = L.cookies;
      h(c.s1h); p(c.s1p);
      h(c.s2h);
      ul([
        `${c.s2item1Strong} ${c.s2item1.trim()}`,
        `${c.s2item2Strong} ${c.s2item2.trim()}`,
        `${c.s2item3Strong} ${c.s2item3.trim()}`,
      ]);
      h(c.s3h); p(c.s3p);
      break;
    }
    case "terms": {
      const t = L.terms;
      h(t.s1h); p(t.s1p);
      h(t.s2h); p(t.s2p);
      h(t.s3h); p(t.s3p);
      h(t.s4h); p(t.s4p);
      h(t.s5h); p(t.s5p);
      h(t.s6h); ul(t.s6items);
      h(t.s7h); p(t.s7p);
      h(t.s8h); p(t.s8p);
      break;
    }
    case "privacy": {
      const pr = L.privacy;
      p(pr.intro);
      h(pr.s1h); p(`${pr.s1pPre}dpd@saludconet.demo${pr.s1pPost}`);
      h(pr.s2h); p(pr.s2p); ul(pr.s2items);
      h(pr.s3h); ul(pr.s3items);
      h(pr.s4h); p(pr.s4p);
      h(pr.s5h); p(pr.s5p);
      h(pr.s6h); p(pr.s6p);
      h(pr.s7h); p(`${pr.s7pPre}dpd@saludconet.demo${pr.s7pPost}`);
      h(pr.s8h); p(pr.s8p);
      break;
    }
    case "legal-notice": {
      const n = L.notice;
      h(n.s1h); p(`${n.s1pPre}hola@saludconet.demo${n.s1pPost}`);
      h(n.s2h); p(n.s2p);
      h(n.s3h); p(n.s3p);
      h(n.s4h); p(n.s4p);
      h(n.s5h); p(n.s5p);
      h(n.s6h); p(n.s6p);
      break;
    }
    case "reservations": {
      const r = L.reservations;
      p(r.intro);
      h(r.s1h); p(r.s1p); p(r.s1p2); p(r.s1p3); p(r.s1listIntro); ul(r.s1items);
      h(r.s2h); p(r.s2p); p(r.s2listIntro); ul(r.s2items); p(r.s2p2);
      h(r.s3h); p(r.s3p); p(r.s3listIntro); ul(r.s3items); p(r.s3p2); p(r.s3p3);
      h(r.s4h); p(r.s4listIntro); ul(r.s4items); p(r.s4p2);
      h(r.s5h); p(r.s5p);
      h(r.s6h); p(r.s6p); ul(r.s6items); p(r.s6p2);
      break;
    }
  }

  return blocks.join("\n\n");
}
