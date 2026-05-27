import type { ReactNode } from "react";

/**
 * Renderiza el texto largo editable de una página legal a nodos React seguros
 * (sin HTML crudo → sin riesgo de XSS). Formato simple:
 *   - Línea que empieza por "## " → encabezado (h2)
 *   - Línea que empieza por "- "  → elemento de lista (se agrupan en <ul>)
 *   - Línea en blanco → separa párrafos
 *   - El resto → párrafo
 * Hereda los estilos `prose` del contenedor de LegalLayout.
 */
export function LegalBody({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      nodes.push(<p key={key++}>{para.join(" ")}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      nodes.push(
        <ul key={key++}>
          {list.map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      nodes.push(<h2 key={key++}>{line.slice(3).trim()}</h2>);
      continue;
    }
    if (line.startsWith("# ")) {
      flushPara();
      flushList();
      nodes.push(<h1 key={key++}>{line.slice(2).trim()}</h1>);
      continue;
    }
    if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2).trim());
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();

  return <>{nodes}</>;
}
