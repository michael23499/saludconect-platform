import { pgTable, pgSchema, pgEnum, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * Modelado mínimo del schema `auth` de Supabase (no lo gestionamos nosotros,
 * solo lo referenciamos para crear FKs con CASCADE). Drizzle Kit NO intenta
 * crear ni alterar nada dentro de este schema — Supabase es el dueño.
 */
const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const userRoleEnum = pgEnum("user_role", ["professional", "clinic", "admin"]);

export const users = pgTable("users", {
  // FK directa al auth.users.id de Supabase. Si se borra el user en Supabase
  // Auth (admin o self-delete), su perfil aquí desaparece también.
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull(),
  phone: text("phone"),
  city: text("city"),
  avatarUrl: text("avatar_url"),
  verified: boolean("verified").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
