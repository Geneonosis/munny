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

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const ledger = sqliteTable("ledger", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bucketId: integer("bucket_id")
    .notNull()
    .references(() => buckets.id),
  categoryId: integer("category_id").references(() => categories.id),
  // Amount stored in cents (e.g. $12.50 = 1250) to avoid floating point issues
  amount: integer("amount").notNull(),
  // 'in' = money entering the bucket, 'out' = money leaving the bucket
  flow: text("flow", { enum: ["in", "out"] }).notNull(),
  note: text("note"),
  // The actual date of the transaction (ISO 8601 date string: YYYY-MM-DD)
  date: text("date").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

