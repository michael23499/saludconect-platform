"use server";

import { promises as dns } from "node:dns";
import { sendAppEmail, renderEmail } from "../notifications/email";
import { notifyMany } from "../notifications/notify";
import { listAdminIds } from "../queries/users";

export type ContactInput = {
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
};

/** Códigos de error (el cliente los traduce y los coloca en el campo correcto). */
export type ContactErrorCode = "fields" | "email" | "email_undeliverable";
export type ContactResult = { ok: true } | { error: ContactErrorCode };

/** Bandeja a la que llegan los mensajes del formulario de contacto. */
const INBOX = process.env.CONTACT_INBOX ?? "info@saludconet.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Escapa HTML para insertar texto del usuario en el cuerpo del correo sin riesgo de inyección. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Comprueba por DNS que el dominio del correo realmente puede recibir mensajes
 * (registros MX; con fallback a A/AAAA según RFC 5321). Detecta typos como
 * "gmail.con" o dominios inexistentes sin enviar nada. Ante un fallo de red o
 * DNS transitorio damos el beneficio de la duda (no bloqueamos un correo válido).
 */
async function domainCanReceiveEmail(email: string): Promise<boolean> {
  const domain = email.slice(email.lastIndexOf("@") + 1).toLowerCase();
  if (!domain || domain.indexOf(".") === -1) return false;
  try {
    const mx = await dns.resolveMx(domain);
    if (mx.length > 0) return true;
    // Dominio sin MX: aún puede recibir por su registro A/AAAA.
    await dns.lookup(domain);
    return true;
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    // Dominio que no existe / sin registros → no entregable.
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "NXDOMAIN") return false;
    // Timeout u otro fallo transitorio de DNS: no penalizamos al visitante.
    return true;
  }
}

/**
 * Mensaje del formulario de contacto público (sin sesión). Hace dos cosas:
 *  1) Envía un correo a la bandeja del equipo (reply-to = visitante, para
 *     responder con un clic).
 *  2) Crea una notificación in-app para todos los administradores (la campana
 *     del panel admin), para que quede registrado dentro de la plataforma.
 * Nunca falla por un problema de email: las notificaciones in-app son el canal
 * fiable. La validación fuerte vive aquí (el cliente solo da feedback rápido).
 */
export async function sendContactMessageAction(input: ContactInput): Promise<ContactResult> {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const company = input.company?.trim() ?? "";
  const subject = input.subject?.trim() || "Consulta general";
  const message = input.message?.trim() ?? "";

  if (name.length < 2 || message.length < 1) return { error: "fields" };
  if (!EMAIL_RE.test(email)) return { error: "email" };
  if (!(await domainCanReceiveEmail(email))) return { error: "email_undeliverable" };

  const subjectLine = `Nuevo mensaje de contacto · ${subject}`;
  const html = renderEmail({
    heading: "Nuevo mensaje de contacto",
    intro: `Has recibido un mensaje desde el formulario de contacto de la web.`,
    lines: [
      `<strong>Nombre:</strong> ${esc(name)}`,
      `<strong>Email:</strong> ${esc(email)}`,
      ...(company ? [`<strong>Clínica/Profesional:</strong> ${esc(company)}`] : []),
      `<strong>Asunto:</strong> ${esc(subject)}`,
      `<strong>Mensaje:</strong><br>${esc(message).replace(/\n/g, "<br>")}`,
    ],
  });

  // El correo nunca debe tumbar la acción: sendAppEmail ya captura sus errores.
  await sendAppEmail({ to: INBOX, subject: subjectLine, html, replyTo: email });

  // Detalle completo que se guarda en la notificación (texto plano, multilínea).
  // La 1.ª línea sirve de vista previa en la lista; el resto se ve al abrirla.
  const detail = [
    `De: ${name} <${email}>`,
    ...(company ? [`Clínica/Profesional: ${company}`] : []),
    `Asunto: ${subject}`,
    "",
    message,
  ].join("\n");

  // Notificación in-app a todos los administradores. Sin `link`: al hacer clic se
  // abre el detalle del mensaje en un modal (no navega a ninguna ruta).
  try {
    const adminIds = await listAdminIds();
    if (adminIds.length > 0) {
      await notifyMany(
        adminIds.map((userId) => ({
          userId,
          type: "contact_message" as const,
          title: `Nuevo mensaje de contacto · ${subject}`,
          body: detail,
          link: null,
        })),
      );
    }
  } catch (e) {
    // Si falla la notificación in-app, el correo ya salió: no rompemos el envío.
    console.error("[contact] no se pudo crear la notificación in-app:", e);
  }

  return { ok: true };
}
