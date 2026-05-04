import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

function createDb(): DbInstance {
  const url = process.env.DATABASE_URL ?? "./data/munny.db";
  const sqlite = new Database(url);
  sqlite.pragma("journal_mode = WAL");
  return drizzle(sqlite, { schema });
}

let _instance: DbInstance | null = null;

function getInstance(): DbInstance {
  if (!_instance) _instance = createDb();
  return _instance;
}

// Lazy proxy — the database file is not opened until the first query is made.
// This allows Next.js to import this module at build time without a live DB.
export const db = new Proxy({} as DbInstance, {
  get(_, prop) {
    return getInstance()[prop as keyof DbInstance];
  },
});

