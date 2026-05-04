import { db } from "./index";
import { bucketTypes } from "./schema";
import { sql } from "drizzle-orm";

const SYSTEM_BUCKET_TYPES = [
  "checking",
  "savings",
  "credit",
  "cash",
  "investment",
  "crypto",
  "brokerage",
];

export async function seed() {
  for (const name of SYSTEM_BUCKET_TYPES) {
    db.run(
      sql`INSERT OR IGNORE INTO ${bucketTypes} (name, is_system) VALUES (${name}, 1)`
    );
  }
  console.log("✓ Seeded system bucket types");
}

