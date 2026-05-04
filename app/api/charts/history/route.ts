export const dynamic = "force-dynamic";

import { db } from "@/db";
import { ledger, buckets, bucketTypes } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { json } from "../../_lib/response";

export async function GET() {
  // All non-deleted buckets
  const allBuckets = db
    .select({
      id: buckets.id,
      name: buckets.name,
      currency: buckets.currency,
      type: bucketTypes.name,
    })
    .from(buckets)
    .innerJoin(bucketTypes, eq(buckets.typeId, bucketTypes.id))
    .where(ne(buckets.status, "deleted"))
    .all();

  // All ledger entries sorted by date
  const entries = db
    .select()
    .from(ledger)
    .orderBy(ledger.date, ledger.id)
    .all();

  // Compute running balance per bucket at each transaction date
  const balanceMap: Record<number, number> = {};
  for (const b of allBuckets) balanceMap[b.id] = 0;

  // Unique sorted transaction dates
  const dates = [...new Set(entries.map((e) => e.date))].sort();

  // Build series: one object per date with bucketId keys
  const series: Record<string, number | string>[] = [];
  let entryIdx = 0;

  for (const date of dates) {
    // Apply all entries for this date
    while (entryIdx < entries.length && entries[entryIdx].date === date) {
      const e = entries[entryIdx];
      if (balanceMap[e.bucketId] !== undefined) {
        balanceMap[e.bucketId] += e.flow === "in" ? e.amount : -e.amount;
      }
      entryIdx++;
    }
    series.push({ date, ...Object.fromEntries(Object.entries(balanceMap).map(([k, v]) => [k, v])) });
  }

  // Determine which buckets have non-zero balance at the end
  const activeBucketIds = new Set(
    allBuckets.filter((b) => (balanceMap[b.id] ?? 0) !== 0).map((b) => b.id)
  );

  const activeBuckets = allBuckets.filter((b) => activeBucketIds.has(b.id));

  return json({ buckets: activeBuckets, series });
}

