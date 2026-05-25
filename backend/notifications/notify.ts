import "server-only";
import type { NotificationType } from "../db";
import { createNotification, createNotifications } from "../queries/notifications";
import { sendAppEmail, type EmailContent } from "./email";

/**
 * Capa de "avisar a un usuario": crea SIEMPRE la notificación in-app (la
 * campana) y, opcionalmente, manda un email. Las server actions llaman aquí en
 * vez de tocar las tablas/Resend directamente, para que el comportamiento sea
 * consistente en todos los eventos del marketplace.
 */
export type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  email?: EmailContent | null;
};

export async function notify(input: NotifyInput): Promise<void> {
  await createNotification({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
  });
  if (input.email) {
    await sendAppEmail({ to: input.email.to, subject: input.email.subject, html: input.email.html });
  }
}

/**
 * Avisa a varios usuarios del mismo evento (p.ej. una cirugía nueva a todos los
 * técnicos compatibles). Crea las notificaciones in-app en un solo insert y
 * envía los emails individualmente (sin exponer destinatarios entre sí).
 */
export async function notifyMany(
  inputs: NotifyInput[],
): Promise<void> {
  if (inputs.length === 0) return;
  await createNotifications(
    inputs.map((i) => ({
      userId: i.userId,
      type: i.type,
      title: i.title,
      body: i.body ?? null,
      link: i.link ?? null,
    })),
  );
  await Promise.all(
    inputs
      .filter((i) => i.email)
      .map((i) => sendAppEmail({ to: i.email!.to, subject: i.email!.subject, html: i.email!.html })),
  );
}
