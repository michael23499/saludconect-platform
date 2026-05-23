"use client";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

type Role = "professional" | "clinic";

export type Message = { from: "me" | "them"; text: string; time: string };

export type Thread = {
  id: string;
  name: string;
  role: string;
  city: string;
  online: boolean;
  unread: number;
  pinned?: boolean;
  preview: string;
  lastTime: string;
  messages: Message[];
};

export function MessagesView({ role, threads }: { role: Role; threads: Thread[] }) {
  const [selectedId, setSelectedId] = useState(threads[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) =>
      [t.name, t.role, t.city, t.preview].join(" ").toLowerCase().includes(q)
    );
  }, [threads, query]);

  const selected = useMemo(
    () => threads.find((t) => t.id === selectedId) ?? threads[0] ?? null,
    [threads, selectedId]
  );

  const totalUnread = threads.reduce((acc, t) => acc + t.unread, 0);
  const [mobilePane, setMobilePane] = useState<"list" | "thread">("list");

  return (
    <div className="grid h-[calc(100vh-16rem)] min-h-[520px] gap-0 overflow-hidden rounded-2xl border border-mist-200 bg-white lg:h-[calc(100vh-14rem)] lg:min-h-[640px] lg:grid-cols-[340px_1fr]">
      {/* Thread list */}
      <aside className={cn(
        "min-h-0 flex-col border-b border-mist-200 lg:flex lg:border-b-0 lg:border-r",
        mobilePane === "list" ? "flex" : "hidden"
      )}>
        <div className="border-b border-mist-100 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold tracking-tight text-ink-900">Mensajes</div>
            {totalUnread > 0 && <Badge tone="brand">{totalUnread} sin leer</Badge>}
          </div>
          <div className="relative mt-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={role === "professional" ? "Buscar clínica…" : "Buscar profesional…"}
              className="h-9 w-full rounded-lg border border-mist-200 bg-white pl-9 pr-3 text-xs text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" />
            </svg>
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {filtered.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(t.id);
                  setMobilePane("thread");
                }}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-mist-100 p-4 text-left transition",
                  selected?.id === t.id ? "bg-brand-50/60" : "hover:bg-mist-50"
                )}
              >
                <div className="relative">
                  <Avatar name={t.name} size="md" />
                  {t.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      {t.pinned && <span className="text-brand-700" title="Anclado">★</span>}
                      <span className="truncate text-sm font-semibold text-ink-900">{t.name}</span>
                    </div>
                    <span className="text-[10px] text-mist-500">{t.lastTime}</span>
                  </div>
                  <div className="text-[11px] text-mist-500">{t.role} · {t.city}</div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-mist-600">{t.preview}</p>
                    {t.unread > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                        {t.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Conversation pane */}
      {selected ? (
        <section className={cn(
          "min-h-0 flex-col lg:flex",
          mobilePane === "thread" ? "flex" : "hidden"
        )}>
          {/* Header */}
          <header className="flex items-center justify-between border-b border-mist-100 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => setMobilePane("list")}
                aria-label="Volver"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-200 text-ink-700 hover:bg-mist-50 lg:hidden"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div className="relative">
                <Avatar name={selected.name} size="md" />
                {selected.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink-900">{selected.name}</div>
                <div className="truncate text-[11px] text-mist-500">
                  {selected.online ? "En línea ahora" : "Visto hace 2 h"} · {selected.role}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden md:contents">
                <IconBtn label="Llamar"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.86 19.86 0 01-3.07-8.67A2 2 0 014.12 2h3a2 2 0 012 1.72c.13.9.31 1.78.57 2.62a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.46-1.16a2 2 0 012.11-.45c.84.26 1.72.45 2.62.57A2 2 0 0122 16.92z" /></svg></IconBtn>
                <IconBtn label="Videollamada"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg></IconBtn>
              </span>
              <IconBtn label="Más"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg></IconBtn>
            </div>
          </header>

          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-mist-50/40 p-5">
            <div className="mx-auto max-w-2xl space-y-3">
              <div className="my-2 text-center text-[10px] font-semibold uppercase tracking-wider text-mist-500">Hoy</div>
              {selected.messages.map((m, i) => (
                <Bubble key={i} message={m} />
              ))}
              <div className="my-2 flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-xs text-ink-800">
                <svg className="h-4 w-4 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /></svg>
                <span><strong>Reserva acordada:</strong> {role === "professional" ? "Mié 28 May 2026 · 08:00–14:00 · Cardiología" : "Mié 28 May 2026 · 08:00–14:00"}</span>
                <button className="ml-auto rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-50">Ver reserva</button>
              </div>
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-mist-100 p-4">
            <div className="flex items-end gap-2">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-mist-200 text-mist-500 hover:bg-mist-50" aria-label="Adjuntar">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.4 11l-9 9a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5L11 17.6a2 2 0 11-3-2.8l7-7" /></svg>
              </button>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribe un mensaje…"
                rows={1}
                className="min-h-10 flex-1 resize-none rounded-lg border border-mist-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={() => setDraft("")}
                disabled={!draft.trim()}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-xs font-semibold text-white shadow-[0_8px_18px_-10px_rgba(37,99,235,0.7)] hover:bg-brand-700 disabled:opacity-40"
              >
                Enviar
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(role === "professional"
                ? ["Confirmo asistencia", "Necesito 5 min más", "Comparte ubicación"]
                : ["Te confirmamos a las 18 h", "Adjunto detalles del caso", "¿Disponible para mañana?"]
              ).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setDraft(q)}
                  className="rounded-full border border-mist-200 bg-mist-50/60 px-2.5 py-1 text-[11px] font-medium text-ink-800 hover:bg-white"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="hidden items-center justify-center p-12 text-mist-500 lg:flex">
          Selecciona una conversación para empezar.
        </section>
      )}
    </div>
  );
}

function IconBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-200 text-ink-700 hover:bg-mist-50" aria-label={label} type="button">
      {children}
    </button>
  );
}

function Bubble({ message }: { message: Message }) {
  const mine = message.from === "me";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
        mine
          ? "rounded-br-md bg-brand-600 text-white"
          : "rounded-bl-md border border-mist-200 bg-white text-ink-900"
      )}>
        <p>{message.text}</p>
        <div className={cn("mt-1 text-[10px]", mine ? "text-white/70" : "text-mist-400")}>{message.time}</div>
      </div>
    </div>
  );
}
