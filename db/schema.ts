import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const bucketTypes = sqliteTable("bucket_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const buckets = sqliteTable("buckets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  typeId: integer("type_id")
    .notNull()
    .references(() => bucketTypes.id),
  currency: text("currency").notNull().default("USD"),
  status: text("status", {
    enum: ["active", "archived", "deactivated", "deleted"],
  })
    .notNull()
    .default("active"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

