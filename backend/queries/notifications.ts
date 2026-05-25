import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db, notifications, type Notification, type NewNotification } from "../db";

/** Crea una notificación in-app. */
export async function createNotification(data: NewNotification): Promise<void> {
  await db.insert(notifications).values(data);
}

/** Crea varias notificaciones de golpe (p.ej. avisar a todos los técnicos). */
export async function createNotifications(data: NewNotification[]): Promise<void> {
  if (data.length === 0) return;
  await db.insert(notifications).values(data);
}

export async function listNotificationsByUser(
  userId: string,
  limit = 20,
): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return rows[0]?.n ?? 0;
}

/** Marca una notificación como leída (verificando que pertenece al usuario). */
export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}
