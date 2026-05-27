"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/Providers";
import { useActionToast } from "@/lib/use-action-toast";
import { textToHtml, htmlToText } from "@/lib/legal-format";
import { saveSiteContentAction } from "@backend/actions/site-content";

export type LegalDoc = { key: string; label: string; href: string; es: string; en: string };
type Lang = "es" | "en";

/**
 * Editor WYSIWYG de UN documento legal: un lienzo que se ve como la página
 * (editable en sitio) + un módulo a la derecha (idioma, formato, guardar).
 * Dark-safe. La conversión a texto seguro la hace legal-format al guardar.
 */
export function SingleLegalEditor({ doc }: { doc: LegalDoc }) {
  const t = useApp().t;
  const a = t.adminContent;
  const { report } = useActionToast();
  const editorRef = useRef<HTMLDivElement>(null);

  const [lang, setLang] = useState<Lang>("es");
  const [texts, setTexts] = useState<{ es: string; en: string }>({ es: doc.es, en: doc.en });
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  // Sembrar el lienzo al montar y al cambiar de idioma (no en cada tecla).
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = textToHtml(texts[lang]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  function capture() {
    if (editorRef.current) {
      const cur = htmlToText(editorRef.current);
      setTexts((prev) => ({ ...prev, [lang]: cur }));
    }
  }
  function switchLang(l: Lang) {
    if (l === lang) return;
    capture();
    setLang(l);
  }
  function format(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setDirty(true);
  }
  function save() {
    const cur = editorRef.current ? htmlToText(editorRef.current) : texts[lang];
    const payload = { ...texts, [lang]: cur };
    setTexts(payload);
    startTransition(async () => {
      const r1 = await saveSiteContentAction(doc.key, "es", payload.es);
      const r2 = await saveSiteContentAction(doc.key, "en", payload.en);
      const bad = [r1, r2].find((r) => "error" in r);
      if (bad) report(bad);
      else {
        report({ ok: true }, t.toasts.saved);
        setDirty(false);
      }
    });
  }

  const toolBtn =
    "inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-mist-200 bg-white text-sm font-semibold text-ink-700 transition hover:bg-mist-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      {/* UN lienzo: se ve como la página y se edita en sitio (dark-safe) */}
      <div
        key={lang}
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => setDirty(true)}
        className="prose prose-zinc min-h-[60vh] max-w-none rounded-2xl border border-mist-200 bg-white p-6 text-[15px] leading-relaxed text-ink-800 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 md:p-8 [&_h1]:mb-4 [&_h1]:mt-0 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-ink-900 [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink-900 [&_li]:my-1 [&_p]:mb-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 dark:border-white/10 dark:bg-white/[0.03] dark:text-[#cdd5e0] dark:[&_h1]:text-[#eef2f8] dark:[&_h2]:text-[#eef2f8] dark:[&_strong]:text-[#eef2f8]"
      />

      {/* Módulo de edición a la derecha */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-4 rounded-2xl border border-mist-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-mist-500">
              {a.langEs} / {a.langEn}
            </div>
            <div className="flex gap-1 rounded-lg bg-mist-100 p-0.5 dark:bg-white/5">
              {(["es", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => switchLang(l)}
                  className={
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition " +
                    (lang === l
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-ink-600 hover:bg-white hover:text-ink-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white")
                  }
                >
                  {l === "es" ? a.langEs : a.langEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-mist-500">{a.historyLabel}</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button type="button" className={toolBtn} onMouseDown={(e) => { e.preventDefault(); format("undo"); }}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></svg>
                {a.btnUndo}
              </button>
              <button type="button" className={toolBtn} onMouseDown={(e) => { e.preventDefault(); format("redo"); }}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h3" /></svg>
                {a.btnRedo}
              </button>
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-mist-500">{a.formatLabel}</div>
            <div className="space-y-1.5">
              <button type="button" className={toolBtn} onMouseDown={(e) => { e.preventDefault(); format("formatBlock", "h2"); }}>
                {a.btnHeading}
              </button>
              <button type="button" className={toolBtn} onMouseDown={(e) => { e.preventDefault(); format("formatBlock", "p"); }}>
                {a.btnParagraph}
              </button>
              <button type="button" className={toolBtn} onMouseDown={(e) => { e.preventDefault(); format("insertUnorderedList"); }}>
                {a.btnBullet}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center border-t border-mist-100 pt-3 dark:border-white/10">
            <button
              type="button"
              onClick={save}
              disabled={pending || !dirty}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-40 dark:text-cyan-300 dark:hover:bg-white/5"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {pending ? a.saving : a.save}
            </button>
            <Link
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center text-xs font-semibold text-brand-700 hover:underline dark:text-cyan-300"
            >
              {a.open} →
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
