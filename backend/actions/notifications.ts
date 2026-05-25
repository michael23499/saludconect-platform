"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "../auth/guards";
import { markNotificationRead, markAllNotificationsRead } from "../queries/notifications";

/** Marca una notificación como leída (solo las propias). */
export async function markNotificationReadAction(id: string): Promise<void> {
  const user = await requireProfile();
  await markNotificationRead(id, user.profile.id);
  revalidatePath("/dashboard", "layout");
}

/** Marca todas las notificaciones del usuario como leídas. */
export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireProfile();
  await markAllNotificationsRead(user.profile.id);
  revalidatePath("/dashboard", "layout");
}
