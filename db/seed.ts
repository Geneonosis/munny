import { db } from "./index";
import { buckets, bucketTypes, ledger } from "./schema";
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
    const exists = db
      .select({ id: buckets.id })
      .from(buckets)
      .where(sql`name = ${bucket.name} AND type_id = ${bucket.typeId}`)
      .get();
    if (!exists) {
      db.run(
        sql`INSERT INTO ${buckets} (name, type_id, currency, status) VALUES (${bucket.name}, ${bucket.typeId}, ${bucket.currency}, ${bucket.status})`
      );
    }
  }

  console.log("✓ Seeded mock dev buckets");

  const allBuckets = db.select().from(buckets).all();
  const bucketByName = Object.fromEntries(allBuckets.map((b) => [b.name, b.id]));

  const mockEntries = [
    // Chase Checking
    { bucketId: bucketByName["Chase Checking"], amount: 250000, flow: "in",  note: "Opening deposit",      date: "2026-01-01" },
    { bucketId: bucketByName["Chase Checking"], amount:   8500, flow: "out", note: "Grocery run",          date: "2026-01-05" },
    { bucketId: bucketByName["Chase Checking"], amount:  15000, flow: "out", note: "Electric bill",        date: "2026-01-10" },
    { bucketId: bucketByName["Chase Checking"], amount: 320000, flow: "in",  note: "Paycheck",             date: "2026-02-01" },
    { bucketId: bucketByName["Chase Checking"], amount:  12000, flow: "out", note: "Internet + streaming", date: "2026-02-03" },
    // Chase Savings
    { bucketId: bucketByName["Chase Savings"],  amount: 500000, flow: "in",  note: "Initial transfer",     date: "2026-01-01" },
    { bucketId: bucketByName["Chase Savings"],  amount:  50000, flow: "in",  note: "Monthly contribution", date: "2026-02-01" },
    // Amex Gold
    { bucketId: bucketByName["Amex Gold"],      amount:  24999, flow: "out", note: "Restaurant dinner",    date: "2026-01-15" },
    { bucketId: bucketByName["Amex Gold"],      amount:  59900, flow: "out", note: "Hotel stay",           date: "2026-01-20" },
    { bucketId: bucketByName["Amex Gold"],      amount:  84899, flow: "in",  note: "Payment",              date: "2026-02-01" },
    // Wallet Cash
    { bucketId: bucketByName["Wallet Cash"],    amount:  20000, flow: "in",  note: "ATM withdrawal",       date: "2026-01-08" },
    { bucketId: bucketByName["Wallet Cash"],    amount:   1200, flow: "out", note: "Coffee",               date: "2026-01-09" },
    // Coinbase
    { bucketId: bucketByName["Coinbase"],       amount:  50000, flow: "in",  note: "BTC purchase",         date: "2026-01-12" },
    { bucketId: bucketByName["Coinbase"],       amount:  10000, flow: "out", note: "Sold ETH",             date: "2026-02-10" },
  ] as const;

  for (const entry of mockEntries) {
    const exists = db
      .select({ id: ledger.id })
      .from(ledger)
      .where(sql`bucket_id = ${entry.bucketId} AND note = ${entry.note} AND date = ${entry.date}`)
      .get();
    if (!exists) {
      db.run(
        sql`INSERT INTO ${ledger} (bucket_id, amount, flow, note, date)
            VALUES (${entry.bucketId}, ${entry.amount}, ${entry.flow}, ${entry.note}, ${entry.date})`
      );
    }
  }

  console.log("✓ Seeded mock ledger entries");
}

