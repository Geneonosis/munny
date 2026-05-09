import fs from "node:fs";
import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "../db/index";
import { seedDev } from "../db/seed";

async function main() {
  const dbDir = path.dirname(process.env.DATABASE_URL ?? "./data/munny-dev.db");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log("Running migrations (dev)...");
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  console.log("✓ Migrations complete");

  await seedDev();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
