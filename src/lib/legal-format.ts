/**
 * Conversión entre el formato de almacenamiento de los textos legales
 * (texto simple: "## " títulos, "- " viñetas, líneas en blanco = párrafos) y el
 * HTML del editor WYSIWYG (contentEditable). Mantener en sync con LegalBody.
 */

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Texto → HTML para sembrar el contentEditable (lo que se ve = la página). */
export function textToHtml(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => {
    if (para.length) {
      html += `<p>${escapeHtml(para.join(" "))}</p>`;
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      html += `<ul>${list.map((li) => `<li>${escapeHtml(li)}</li>`).join("")}</ul>`;
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
      html += `<h2>${escapeHtml(line.slice(3).trim())}</h2>`;
      continue;
    }
    if (line.startsWith("# ")) {
      flushPara();
      flushList();
      html += `<h1>${escapeHtml(line.slice(2).trim())}</h1>`;
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
  return html || "<p><br></p>";
}

/**
 * DOM del contentEditable → texto seguro para guardar. Recorre los bloques de
 * nivel superior: encabezados → "## ", listas → "- " por ítem, el resto →
 * párrafo. No conserva HTML (la página pública lo re-renderiza con LegalBody).
 */
export function htmlToText(root: HTMLElement): string {
  const blocks: string[] = [];
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const tx = (node.textContent ?? "").trim();
      if (tx) blocks.push(tx);
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    const tag = node.tagName.toLowerCase();
    if (tag === "h1") {
      const tx = (node.textContent ?? "").trim();
      if (tx) blocks.push(`# ${tx}`);
    } else if (/^h[2-6]$/.test(tag)) {
      const tx = (node.textContent ?? "").trim();
      if (tx) blocks.push(`## ${tx}`);
    } else if (tag === "ul" || tag === "ol") {
      const items = Array.from(node.querySelectorAll("li"))
        .map((li) => (li.textContent ?? "").trim())
        .filter(Boolean)
        .map((t) => `- ${t}`);
      if (items.length) blocks.push(items.join("\n"));
    } else if (tag !== "br") {
      const tx = (node.textContent ?? "").trim();
      if (tx) blocks.push(tx);
    }
  });
  return blocks.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}
