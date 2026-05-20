"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type QA = { q: string; a: string; cat: CatId };
type CatId = "general" | "profesionales" | "clinicas" | "precios" | "soporte";

const CATEGORIES: { id: CatId; label: string; icon: string }[] = [
  { id: "general", label: "Sobre SaludCoNet", icon: "info" },
  { id: "profesionales", label: "Profesionales", icon: "user" },
  { id: "clinicas", label: "Clínicas", icon: "building" },
  { id: "precios", label: "Precios", icon: "tag" },
  { id: "soporte", label: "Soporte", icon: "help" },
];

const FAQS: QA[] = [
  {
    cat: "general",
    q: "¿Qué es SaludCoNet?",
    a: "Somos la red profesional sanitaria que conecta clínicas privadas con profesionales sanitarios verificados en toda España. Publica una necesidad y recibe candidatos cualificados en minutos.",
  },
  {
    cat: "general",
    q: "¿Qué especialidades cubrís?",
    a: "Medicina, enfermería, fisioterapia, podología, odontología, óptica, psicología, nutrición y especialidades técnicas como auxiliares y técnicos sanitarios.",
  },
  {
    cat: "general",
    q: "¿Dónde operáis?",
    a: "Operamos en toda España, con mayor densidad de profesionales en Madrid, Barcelona, Valencia, Sevilla, Bilbao y Málaga.",
  },
  {
    cat: "profesionales",
    q: "¿Cómo verificáis a los profesionales?",
    a: "Validamos colegiación, titulación oficial y experiencia. Solo los profesionales verificados pueden recibir reservas de clínicas a través de la plataforma.",
  },
  {
    cat: "profesionales",
    q: "¿Cómo me registro como profesional?",
    a: "Entra en /registro, elige el perfil profesional, sube tu colegiación y completa tu disponibilidad. Verificamos tu perfil en menos de 24 horas.",
  },
  {
    cat: "profesionales",
    q: "¿Cuándo y cómo cobro?",
    a: "Cobras de forma segura mediante transferencia tras cada servicio confirmado por la clínica. El plazo medio es de 3 a 5 días laborables.",
  },
  {
    cat: "clinicas",
    q: "¿Cuánto tarda en cubrirse una vacante?",
    a: "El tiempo medio de respuesta es inferior a 30 minutos. La mayoría de las urgencias se cubren el mismo día gracias a nuestra red activa.",
  },
  {
    cat: "clinicas",
    q: "¿Cómo publico una necesidad?",
    a: "Desde el área de la clínica pulsa “Publicar necesidad”, indica especialidad, fechas y condiciones. Los profesionales compatibles reciben aviso al instante.",
  },
  {
    cat: "clinicas",
    q: "¿Puedo reservar siempre al mismo profesional?",
    a: "Sí. Puedes marcar profesionales favoritos y darles prioridad o reservarlos directamente para tus próximas vacantes.",
  },
  {
    cat: "precios",
    q: "¿Cuánto cuesta la plataforma?",
    a: "Para profesionales el registro es 100% gratuito. Las clínicas eligen entre planes mensuales según su volumen de contratación. Consulta /precios para ver el detalle.",
  },
  {
    cat: "precios",
    q: "¿Hay permanencia?",
    a: "No. Todos los planes son mensuales y puedes cancelar cuando quieras desde tu panel de administración.",
  },
  {
    cat: "precios",
    q: "¿Cómo se factura?",
    a: "Toda la facturación se centraliza en la plataforma: las clínicas reciben factura mensual con el detalle de los servicios contratados.",
  },
  {
    cat: "soporte",
    q: "¿Tenéis soporte humano?",
    a: "Sí. Nuestro equipo de soporte está disponible por chat y email de lunes a viernes de 9:00 a 19:00. Para urgencias clínicas, contamos con guardia 24/7.",
  },
  {
    cat: "soporte",
    q: "¿Mis datos están seguros?",
    a: "Cumplimos RGPD y LOPDGDD. Los datos clínicos y de colegiación se cifran en tránsito y en reposo, y nunca se comparten sin consentimiento.",
  },
  {
    cat: "soporte",
    q: "¿Cómo contacto con un humano?",
    a: "Puedes escribirnos a hola@saludconet.es o desde /contacto. Te respondemos en menos de 2 horas laborables.",
  },
];

type Message =
  | { id: string; kind: "bot"; text: string }
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "menu" }
  | { id: string; kind: "questions"; cat: CatId };

const initialMessages = (): Message[] => [
  {
    id: "welcome",
    kind: "bot",
    text: "¡Hola! 👋 Soy el asistente de SaludCoNet. Elige una categoría para ver las preguntas más frecuentes.",
  },
  { id: "menu-0", kind: "menu" },
];

function Icon({ name, className }: { name: string; className?: string }) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "info":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8h.01M11 12h1v5h1" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "building":
      return (
        <svg {...props}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M9 7h.01M9 11h.01M9 15h.01M14 7h.01M14 11h.01M14 15h.01" />
        </svg>
      );
    case "tag":
      return (
        <svg {...props}>
          <path d="M20 12V5a1 1 0 0 0-1-1h-7L3 13l8 8 9-9z" />
          <circle cx="8.5" cy="8.5" r="1.2" />
        </svg>
      );
    case "help":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" />
        </svg>
      );
    default:
      return null;
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    if (open && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Autoscroll to bottom whenever messages change or panel opens
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open]);

  const stamp = () => Math.random().toString(36).slice(2, 9);

  function showCategory(cat: CatId) {
    setMessages((prev) => [
      ...prev,
      { id: stamp(), kind: "user", text: CATEGORIES.find((c) => c.id === cat)?.label || "" },
      { id: stamp(), kind: "questions", cat },
    ]);
  }

  function pickQuestion(qa: QA) {
    setMessages((prev) => [...prev, { id: stamp(), kind: "user", text: qa.q }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: stamp(), kind: "bot", text: qa.a },
        { id: stamp(), kind: "menu" },
      ]);
    }, 400);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMessages((prev) => [...prev, { id: stamp(), kind: "user", text }]);

    // Fuzzy match
    const lower = text.toLowerCase();
    const hit = FAQS.find((qa) =>
      qa.q.toLowerCase().includes(lower) || lower.split(" ").some((w) => w.length > 3 && qa.q.toLowerCase().includes(w)),
    );

    setTimeout(() => {
      if (hit) {
        setMessages((prev) => [
          ...prev,
          { id: stamp(), kind: "bot", text: hit.a },
          { id: stamp(), kind: "menu" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: stamp(),
            kind: "bot",
            text: "No tengo una respuesta exacta para eso. Puedes elegir una categoría o escribirnos a hola@saludconet.es y te respondemos enseguida.",
          },
          { id: stamp(), kind: "menu" },
        ]);
      }
    }, 450);
  }

  function reset() {
    setMessages(initialMessages());
  }

  const questionsByCat = useMemo(() => {
    const map: Record<CatId, QA[]> = {
      general: [],
      profesionales: [],
      clinicas: [],
      precios: [],
      soporte: [],
    };
    for (const qa of FAQS) map[qa.cat].push(qa);
    return map;
  }, []);

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat de ayuda" : "Abrir chat de ayuda"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full",
          "bg-brand-600 text-white shadow-[0_14px_34px_-10px_rgba(37,99,235,0.65)]",
          "transition-all hover:scale-105 hover:bg-brand-700 hover:shadow-[0_18px_40px_-10px_rgba(37,99,235,0.75)]",
          "md:bottom-6 md:right-6",
        )}
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/40" aria-hidden />
        )}
        {open ? (
          <svg className="relative h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg className="relative h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C6.48 2 2 6.04 2 11c0 2.62 1.27 4.97 3.3 6.6L4 22l4.7-1.6c1.05.36 2.16.55 3.3.55 5.52 0 10-4.04 10-9S17.52 2 12 2zm-3.6 9.5a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8zm3.6 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8zm3.6 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z" />
          </svg>
        )}
        {unread && !open && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500" aria-hidden />
        )}
      </button>

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Chat de ayuda de SaludCoNet"
        aria-hidden={!open}
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden border border-mist-200 bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.4)]",
          // Sizing: mobile fullscreen-ish, desktop floating panel
          "inset-x-3 bottom-24 rounded-2xl",
          "sm:inset-x-auto sm:bottom-24 sm:right-5 sm:w-[400px] sm:rounded-2xl",
          "md:right-6",
          "transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
        style={{
          height: "min(640px, calc(100dvh - 7rem))",
        }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 bg-gradient-to-br from-brand-600 to-brand-700 px-4 py-3.5 text-white">
          <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2a5 5 0 0 1 5 5v1h.5A2.5 2.5 0 0 1 20 10.5v3a2.5 2.5 0 0 1-2.5 2.5H17a5 5 0 0 1-4 4.9V22h-2v-1.1a5 5 0 0 1-4-4.9H6.5A2.5 2.5 0 0 1 4 13.5v-3A2.5 2.5 0 0 1 6.5 8H7V7a5 5 0 0 1 5-5z" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold leading-tight">Soporte SaludCoNet</div>
            <div className="text-xs text-white/80">En línea · respuesta inmediata</div>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label="Reiniciar conversación"
            title="Reiniciar conversación"
            className="rounded-full p-2 text-white/85 transition hover:bg-white/15 hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 3v6h6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="rounded-full p-2 text-white/85 transition hover:bg-white/15 hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Messages (scrollable) */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-gradient-to-b from-mist-50/80 to-white px-3.5 py-4"
        >
          {messages.map((m) => {
            if (m.kind === "bot") {
              return (
                <div key={m.id} className="flex justify-start">
                  <div className="flex max-w-[88%] items-end gap-2">
                    <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M12 2a5 5 0 0 1 5 5v1h.5A2.5 2.5 0 0 1 20 10.5v3a2.5 2.5 0 0 1-2.5 2.5H17a5 5 0 0 1-4 4.9V22h-2v-1.1a5 5 0 0 1-4-4.9H6.5A2.5 2.5 0 0 1 4 13.5v-3A2.5 2.5 0 0 1 6.5 8H7V7a5 5 0 0 1 5-5z" />
                      </svg>
                    </div>
                    <div className="rounded-2xl rounded-bl-md border border-mist-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink-800 shadow-sm">
                      {m.text}
                    </div>
                  </div>
                </div>
              );
            }
            if (m.kind === "user") {
              return (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[88%] rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm">
                    {m.text}
                  </div>
                </div>
              );
            }
            if (m.kind === "menu") {
              return (
                <div key={m.id} className="flex justify-start">
                  <div className="ml-9 flex max-w-[88%] flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => showCategory(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-mist-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Icon name={c.icon} className="h-3.5 w-3.5 text-brand-600" />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }
            if (m.kind === "questions") {
              const list = questionsByCat[m.cat];
              return (
                <div key={m.id} className="flex justify-start">
                  <div className="ml-9 flex w-full max-w-[88%] flex-col gap-1.5">
                    {list.map((qa) => (
                      <button
                        key={qa.q}
                        type="button"
                        onClick={() => pickQuestion(qa)}
                        className="group flex items-center justify-between gap-2 rounded-xl border border-mist-200 bg-white px-3 py-2 text-left text-xs font-medium text-ink-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <span>{qa.q}</span>
                        <svg className="h-3.5 w-3.5 shrink-0 text-mist-400 transition group-hover:text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 items-center gap-2 border-t border-mist-200 bg-white px-3 py-2.5"
        >
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe tu pregunta…"
            className="h-10 flex-1 rounded-full border border-mist-200 bg-mist-50 px-4 text-sm text-ink-900 placeholder:text-mist-500 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            aria-label="Escribe tu pregunta"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Enviar"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3.4 20.6 21 12 3.4 3.4 3.4 10l12 2-12 2z" />
            </svg>
          </button>
        </form>
        <a
          href="/contacto"
          className="shrink-0 border-t border-mist-200 bg-mist-50 px-4 py-2 text-center text-[11px] font-medium text-mist-500 transition hover:bg-mist-100 hover:text-brand-700"
        >
          ¿Prefieres hablar con una persona? Ve a contacto →
        </a>
      </div>
    </>
  );
}
