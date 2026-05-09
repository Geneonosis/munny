import { sql } from "drizzle-orm";
import { db } from "./index";
import { buckets, bucketTypes, categories, ledger } from "./schema";

const SYSTEM_BUCKET_TYPES: { name: string; kind: "asset" | "liability" }[] = [
  // Assets
  { name: "checking", kind: "asset" },
  { name: "savings", kind: "asset" },
  { name: "credit", kind: "asset" },
  { name: "cash", kind: "asset" },
  { name: "investment", kind: "asset" },
  { name: "crypto", kind: "asset" },
  { name: "brokerage", kind: "asset" },
  { name: "real estate", kind: "asset" },
  { name: "vehicle", kind: "asset" },
  // Liabilities
  { name: "mortgage", kind: "liability" },
  { name: "auto loan", kind: "liability" },
  { name: "personal loan", kind: "liability" },
  { name: "student loan", kind: "liability" },
];

const SYSTEM_CATEGORIES = [
  "income",
  "food & dining",
  "groceries",
  "housing",
  "utilities",
  "transportation",
  "entertainment",
  "healthcare",
  "shopping",
  "savings & investment",
  "transfer",
  "other",
];

export async function seed() {
  for (const { name, kind } of SYSTEM_BUCKET_TYPES) {
    db.run(
      sql`INSERT OR IGNORE INTO ${bucketTypes} (name, kind, is_system) VALUES (${name}, ${kind}, 1)`
    );
    // Backfill kind for any rows that were inserted before this column existed
    db.run(
      sql`UPDATE ${bucketTypes} SET kind = ${kind} WHERE name = ${name} AND kind != ${kind}`
    );
  }
  console.log("✓ Seeded system bucket types");

  for (const name of SYSTEM_CATEGORIES) {
    db.run(
      sql`INSERT OR IGNORE INTO ${categories} (name, is_system) VALUES (${name}, 1)`
    );
  }
  console.log("✓ Seeded system categories");
}

export async function seedDev() {
  await seed();

  const allTypes = db.select().from(bucketTypes).all();
  const byName = Object.fromEntries(allTypes.map((t) => [t.name, t.id]));

  const mockBuckets = [
    {
      name: "Chase Checking",
      typeId: byName.checking,
      currency: "USD",
      status: "active",
    },
    {
      name: "Chase Savings",
      typeId: byName.savings,
      currency: "USD",
      status: "active",
    },
    {
      name: "Amex Gold",
      typeId: byName.credit,
      currency: "USD",
      status: "active",
    },
    {
      name: "Wallet Cash",
      typeId: byName.cash,
      currency: "USD",
      status: "active",
    },
    {
      name: "Fidelity Brokerage",
      typeId: byName.brokerage,
      currency: "USD",
      status: "active",
    },
    {
      name: "Coinbase",
      typeId: byName.crypto,
      currency: "USD",
      status: "active",
    },
    {
      name: "Old Savings Account",
      typeId: byName.savings,
      currency: "USD",
      status: "archived",
    },
    {
      name: "Robinhood",
      typeId: byName.investment,
      currency: "USD",
      status: "deactivated",
    },
    // Physical assets — paired with their liabilities below
    {
      name: "Primary Residence",
      typeId: byName["real estate"],
      currency: "USD",
      status: "active",
    },
    {
      name: "Toyota Camry",
      typeId: byName.vehicle,
      currency: "USD",
      status: "active",
    },
    // Liabilities
    {
      name: "Home Mortgage",
      typeId: byName.mortgage,
      currency: "USD",
      status: "active",
    },
    {
      name: "Car Loan",
      typeId: byName["auto loan"],
      currency: "USD",
      status: "active",
    },
  ] as const;

  for (const bucket of mockBuckets) {
    const exists = db
      .select({ id: buckets.id })
      .from(buckets)
      .where(sql`name = ${bucket.name} AND type_id = ${bucket.typeId}`)
      .get();
    if (!exists) {
      db.run(sql`INSERT INTO ${buckets} (name, type_id, currency, status)
                 VALUES (${bucket.name}, ${bucket.typeId}, ${bucket.currency}, ${bucket.status})`);
    }
  }
  console.log("✓ Seeded mock dev buckets");

  const allBuckets = db.select().from(buckets).all();
  const bucketByName = Object.fromEntries(
    allBuckets.map((b) => [b.name, b.id])
  );

  const allCategories = db.select().from(categories).all();
  const catByName = Object.fromEntries(
    allCategories.map((c) => [c.name, c.id])
  );

  const mockEntries = [
    // Chase Checking
    {
      bucketId: bucketByName["Chase Checking"],
      amount: 250000,
      flow: "in",
      note: "Opening deposit",
      date: "2026-01-01",
      category: "income",
    },
    {
      bucketId: bucketByName["Chase Checking"],
      amount: 8500,
      flow: "out",
      note: "Grocery run",
      date: "2026-01-05",
      category: "groceries",
    },
    {
      bucketId: bucketByName["Chase Checking"],
      amount: 15000,
      flow: "out",
      note: "Electric bill",
      date: "2026-01-10",
      category: "utilities",
    },
    {
      bucketId: bucketByName["Chase Checking"],
      amount: 320000,
      flow: "in",
      note: "Paycheck",
      date: "2026-02-01",
      category: "income",
    },
    {
      bucketId: bucketByName["Chase Checking"],
      amount: 12000,
      flow: "out",
      note: "Internet + streaming",
      date: "2026-02-03",
      category: "utilities",
    },
    // Chase Savings
    {
      bucketId: bucketByName["Chase Savings"],
      amount: 500000,
      flow: "in",
      note: "Initial transfer",
      date: "2026-01-01",
      category: "transfer",
    },
    {
      bucketId: bucketByName["Chase Savings"],
      amount: 50000,
      flow: "in",
      note: "Monthly contribution",
      date: "2026-02-01",
      category: "savings & investment",
    },
    // Amex Gold
    {
      bucketId: bucketByName["Amex Gold"],
      amount: 24999,
      flow: "out",
      note: "Restaurant dinner",
      date: "2026-01-15",
      category: "food & dining",
    },
    {
      bucketId: bucketByName["Amex Gold"],
      amount: 59900,
      flow: "out",
      note: "Hotel stay",
      date: "2026-01-20",
      category: "entertainment",
    },
    {
      bucketId: bucketByName["Amex Gold"],
      amount: 84899,
      flow: "in",
      note: "Payment",
      date: "2026-02-01",
      category: "transfer",
    },
    // Wallet Cash
    {
      bucketId: bucketByName["Wallet Cash"],
      amount: 20000,
      flow: "in",
      note: "ATM withdrawal",
      date: "2026-01-08",
      category: "transfer",
    },
    {
      bucketId: bucketByName["Wallet Cash"],
      amount: 1200,
      flow: "out",
      note: "Coffee",
      date: "2026-01-09",
      category: "food & dining",
    },
    // Coinbase
    {
      bucketId: bucketByName.Coinbase,
      amount: 50000,
      flow: "in",
      note: "BTC purchase",
      date: "2026-01-12",
      category: "savings & investment",
    },
    {
      bucketId: bucketByName.Coinbase,
      amount: 10000,
      flow: "out",
      note: "Sold ETH",
      date: "2026-02-10",
      category: "savings & investment",
    },
    // Primary Residence — market value of the home (asset side of the mortgage)
    {
      bucketId: bucketByName["Primary Residence"],
      amount: 42000000,
      flow: "in",
      note: "Purchase price",
      date: "2026-01-01",
      category: "housing",
    },
    // Toyota Camry — purchase value of the car (asset side of the auto loan)
    {
      bucketId: bucketByName["Toyota Camry"],
      amount: 3200000,
      flow: "in",
      note: "Purchase price",
      date: "2026-01-01",
      category: "transportation",
    },
    // Home Mortgage — 'in' = loan principal taken on, 'out' = monthly payment reducing debt
    {
      bucketId: bucketByName["Home Mortgage"],
      amount: 32000000,
      flow: "in",
      note: "Mortgage principal",
      date: "2026-01-01",
      category: "housing",
    },
    {
      bucketId: bucketByName["Home Mortgage"],
      amount: 152000,
      flow: "out",
      note: "January payment",
      date: "2026-01-31",
      category: "housing",
    },
    {
      bucketId: bucketByName["Home Mortgage"],
      amount: 152000,
      flow: "out",
      note: "February payment",
      date: "2026-02-28",
      category: "housing",
    },
    // Car Loan — principal taken on, monthly payments
    {
      bucketId: bucketByName["Car Loan"],
      amount: 2800000,
      flow: "in",
      note: "Auto loan principal",
      date: "2026-01-01",
      category: "transportation",
    },
    {
      bucketId: bucketByName["Car Loan"],
      amount: 49500,
      flow: "out",
      note: "January payment",
      date: "2026-01-31",
      category: "transportation",
    },
    {
      bucketId: bucketByName["Car Loan"],
      amount: 49500,
      flow: "out",
      note: "February payment",
      date: "2026-02-28",
      category: "transportation",
    },
  ] as const;

  for (const entry of mockEntries) {
    const exists = db
      .select({ id: ledger.id })
      .from(ledger)
      .where(
        sql`bucket_id = ${entry.bucketId} AND note = ${entry.note} AND date = ${entry.date}`
      )
      .get();
    if (!exists) {
      const categoryId = catByName[entry.category] ?? null;
      db.run(sql`INSERT INTO ${ledger} (bucket_id, category_id, amount, flow, note, date)
                 VALUES (${entry.bucketId}, ${categoryId}, ${entry.amount}, ${entry.flow}, ${entry.note}, ${entry.date})`);
    }
  }
  console.log("✓ Seeded mock ledger entries");
}
