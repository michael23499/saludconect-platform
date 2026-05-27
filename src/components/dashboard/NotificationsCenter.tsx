"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/Providers";
import { Modal, ModalHeader, ModalBody, ModalFooter, modalBtnPrimary, modalBtnSecondary } from "@/components/ui/Modal";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@backend/actions/notifications";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAtISO: string;
};

// Iconos SVG por tipo de notificación (sin emojis), estilo consistente con la app.
const ICONS: Record<string, { node: ReactNode; cls: string }> = {
  new_surgery: { cls: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-cyan-200", node: <path d="M3 12h4l2 5 4-12 2 7h4" /> },
  application_received: { cls: "bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200", node: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0111 0" /><path d="M18 8v5M15.5 10.5h5" /></> },
  application_confirmed: { cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", node: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></> },
  application_rejected: { cls: "bg-mist-100 text-mist-600 dark:bg-white/10 dark:text-white/60", node: <><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></> },
  surgery_filled: { cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", node: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0111 0" /><path d="M16 12l2 2 4-4" /></> },
  surgery_updated: { cls: "bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200", node: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" /></> },
  surgery_cancelled: { cls: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300", node: <><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></> },
  slot_booked: { cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", node: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="M9 15l2 2 4-4" /></> },
  contact_message: { cls: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-cyan-200", node: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 5 8-5" /></> },
};
const FALLBACK_ICON = { cls: "bg-mist-100 text-mist-600 dark:bg-white/10 dark:text-white/60", node: <><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></> };

// Sobre ABIERTO para los mensajes de contacto ya leídos (el cerrado de ICONS
// queda para los que aún no se han abierto).
const ENVELOPE_OPEN = (
  <>
    <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
    <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
  </>
);

type AgoLabels = {
  agoNow: string;
  agoBefore: string;
  agoAfter: string;
  unitMin: string;
  unitHour: string;
  unitDay: string;
};

function timeAgo(iso: string, t: AgoLabels): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  const join = (n: number, unit: string) => [t.agoBefore, `${n} ${unit}`, t.agoAfter].filter(Boolean).join(" ");
  if (min < 1) return t.agoNow;
  if (min < 60) return join(min, t.unitMin);
  const h = Math.floor(min / 60);
  if (h < 24) return join(h, t.unitHour);
  const d = Math.floor(h / 24);
  return join(d, t.unitDay);
}

export function NotificationsCenter({ initialItems }: { initialItems: NotificationItem[] }) {
  const router = useRouter();
  const m = useApp().t.dashboard.misc;
  const [items, setItems] = useState(initialItems);
  const [detail, setDetail] = useState<NotificationItem | null>(null);
  const [, startTransition] = useTransition();
  const unread = items.filter((i) => !i.read).length;

  // Si el cuerpo del detalle contiene un email (p.ej. el del remitente del
  // formulario de contacto), ofrecemos responderle con un clic.
  const replyEmail = detail?.body?.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? null;

  function open(item: NotificationItem) {
    if (!item.read) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
      startTransition(() => {
        void markNotificationReadAction(item.id);
      });
    }
    // Con ruta → navega. Sin ruta pero con contenido (mensajes de contacto) →
    // abre el detalle en un modal.
    if (item.link) router.push(item.link);
    else if (item.body) setDetail(item);
  }

  function markAll() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    startTransition(() => {
      void markAllNotificationsReadAction();
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></svg>
        </div>
        <div className="text-sm font-semibold text-ink-900">{m.notifEmptyTitle}</div>
        <p className="mx-auto mt-1 max-w-sm text-sm text-mist-500">{m.notifEmptyDesc}</p>
      </div>
    );
  }

  return (
    <>
    <div className="rounded-2xl border border-mist-200 bg-white">
      <div className="flex items-center justify-between border-b border-mist-100 p-4">
        <div className="text-sm font-semibold text-ink-900">
          {unread > 0 ? `${unread} ${m.notifUnread}` : m.notifAllRead}
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            className="text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            {m.notifMarkAll}
          </button>
        )}
      </div>
      <ul className="divide-y divide-mist-100">
        {items.map((item) => {
          const icon = ICONS[item.type] ?? FALLBACK_ICON;
          // Mensaje de contacto ya leído → sobre abierto.
          const iconNode = item.type === "contact_message" && item.read ? ENVELOPE_OPEN : icon.node;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => open(item)}
                className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-mist-50 ${item.read ? "" : "bg-brand-50/30"}`}
              >
                <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${icon.cls}`}>
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {iconNode}
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900">{item.title}</span>
                    {!item.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                  </span>
                  {item.body && <span className="mt-0.5 block truncate text-xs text-mist-600">{item.body.split("\n")[0]}</span>}
                  <span className="mt-1 block text-[11px] text-mist-400">{timeAgo(item.createdAtISO, m)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>

    {detail && (
      <Modal onClose={() => setDetail(null)} labelledBy="notif-detail-title" maxWidth={540}>
        <ModalHeader
          icon={
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M4 7l8 5 8-5" />
            </svg>
          }
          title={m.notifDetailTitle}
          subtitle={detail.title}
          onClose={() => setDetail(null)}
          titleId="notif-detail-title"
          closeLabel={m.notifClose}
        />
        <ModalBody>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-800">{detail.body}</p>
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={() => setDetail(null)} className={modalBtnSecondary}>
            {m.notifClose}
          </button>
          {replyEmail && (
            <a href={`mailto:${replyEmail}`} className={modalBtnPrimary}>
              {m.notifReply}
            </a>
          )}
        </ModalFooter>
      </Modal>
    )}
    </>
  );
}
