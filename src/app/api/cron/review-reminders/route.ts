import { NextResponse, type NextRequest } from "next/server";
import { sendReviewReminders } from "@backend/notifications/review-reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron diario (Vercel) que crea las notificaciones "valora tu experiencia" para
 * los trabajos que terminaron AYER. Protegido con CRON_SECRET: Vercel envía el
 * header `Authorization: Bearer <CRON_SECRET>` en cada ejecución programada.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // "Ayer" en UTC: los trabajos cuya fecha ya pasó (terminaron el día anterior).
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  const dateStr = d.toISOString().slice(0, 10);

  const count = await sendReviewReminders(dateStr);
  return NextResponse.json({ ok: true, date: dateStr, notifications: count });
}
