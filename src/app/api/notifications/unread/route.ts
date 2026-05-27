import { NextResponse } from "next/server";
import { getCurrentUser } from "@backend/auth";
import { countUnreadNotifications } from "@backend/queries/notifications";

// Conteo de notificaciones sin leer del usuario en sesión. Lo consulta la
// campana del header por sondeo (no hay realtime) para actualizar el badge y
// disparar la animación sin recargar. Siempre dinámico (sin caché).
export const dynamic = "force-dynamic";

export async function GET() {
  const current = await getCurrentUser();
  const profile = current?.profile;
  const hasBell =
    profile &&
    (profile.role === "clinic" || profile.role === "professional" || profile.role === "admin");
  if (!profile || !hasBell) return NextResponse.json({ unread: 0 });

  const unread = await countUnreadNotifications(profile.id);
  return NextResponse.json({ unread });
}
