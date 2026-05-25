import "server-only";

/**
 * Envío de emails transaccionales de la app (no-auth) vía la API REST de Resend.
 * Usamos fetch directo en vez del SDK para no añadir dependencias (el proyecto
 * mantiene 0 vulnerabilidades con overrides). El dominio saludconet.com ya está
 * verificado en Resend (DKIM+SPF). Si falta RESEND_API_KEY, no enviamos pero la
 * app sigue: las notificaciones in-app son el canal principal y siempre se crean.
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FROM = process.env.RESEND_FROM ?? "SaludCoNet <no-reply@saludconet.com>";

export type EmailContent = { to: string | string[]; subject: string; html: string };

export async function sendAppEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY no definida — email omitido:", opts.subject);
    return;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend respondió", res.status, await res.text());
    }
  } catch (e) {
    // Nunca tumbamos la acción del usuario por un fallo de email.
    console.error("[email] fetch falló:", e);
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.saludconet.com";

/**
 * Plantilla HTML mínima y sobria con la marca SaludCoNet (navy + cian). Recibe
 * un saludo, párrafos de cuerpo y un CTA opcional. Mantener inline-styles: los
 * clientes de correo no aplican CSS externo.
 */
export function renderEmail(opts: {
  heading: string;
  intro: string;
  lines?: string[];
  ctaText?: string;
  ctaPath?: string;
}): string {
  const cta =
    opts.ctaText && opts.ctaPath
      ? `<a href="${SITE_URL}${opts.ctaPath}" style="display:inline-block;margin-top:20px;background:#052F59;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:10px">${opts.ctaText}</a>`
      : "";
  const lines = (opts.lines ?? [])
    .map((l) => `<p style="margin:6px 0;color:#334155;font-size:14px;line-height:1.6">${l}</p>`)
    .join("");
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f1f5f9;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <tr><td style="background:linear-gradient(135deg,#052F59,#01ABD4);padding:18px 24px">
        <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:.5px">SaludCoNet</span>
      </td></tr>
      <tr><td style="padding:24px">
        <h1 style="margin:0 0 8px;color:#0f172a;font-size:19px">${opts.heading}</h1>
        <p style="margin:0 0 12px;color:#334155;font-size:14px;line-height:1.6">${opts.intro}</p>
        ${lines}
        ${cta}
      </td></tr>
      <tr><td style="padding:16px 24px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px">
        Recibes este correo porque tienes una cuenta en SaludCoNet.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
