import { eq } from "drizzle-orm";
import { db, users, type User, type NewUser } from "../db";

export async function getUserProfileById(id: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createUserProfile(data: NewUser): Promise<User | null> {
  // onConflictDoNothing: si el perfil ya existe (doble submit / race), no
  // reventamos con error de PK duplicada; devolvemos null y el caller redirige.
  const rows = await db.insert(users).values(data).onConflictDoNothing().returning();
  return rows[0] ?? null;
}
