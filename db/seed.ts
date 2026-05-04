import { db } from "./index";
import { buckets, bucketTypes } from "./schema";
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

export async function seedDev() {
  await seed();

  const allTypes = db.select().from(bucketTypes).all();
  const byName = Object.fromEntries(allTypes.map((t) => [t.name, t.id]));

  const mockBuckets = [
    { name: "Chase Checking",      typeId: byName["checking"],  currency: "USD", status: "active" },
    { name: "Chase Savings",       typeId: byName["savings"],   currency: "USD", status: "active" },
    { name: "Amex Gold",           typeId: byName["credit"],    currency: "USD", status: "active" },
    { name: "Wallet Cash",         typeId: byName["cash"],      currency: "USD", status: "active" },
    { name: "Fidelity Brokerage",  typeId: byName["brokerage"], currency: "USD", status: "active" },
    { name: "Coinbase",            typeId: byName["crypto"],    currency: "USD", status: "active" },
    { name: "Old Savings Account", typeId: byName["savings"],   currency: "USD", status: "archived" },
    { name: "Robinhood",           typeId: byName["investment"], currency: "USD", status: "deactivated" },
  ] as const;

  for (const bucket of mockBuckets) {
    db.run(
      sql`INSERT OR IGNORE INTO ${buckets} (name, type_id, currency, status) VALUES (${bucket.name}, ${bucket.typeId}, ${bucket.currency}, ${bucket.status})`
    );
  }

  console.log("✓ Seeded mock dev buckets");
}

