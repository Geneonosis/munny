export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { buckets, bucketTypes, ledger } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreateBucketDialog } from "@/components/create-bucket-dialog";
import { BalancePieChart } from "@/components/balance-pie-chart";
import { BalanceHistoryChart } from "@/components/balance-history-chart";

function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default function Home() {
  const allBuckets = db
    .select({
      id: buckets.id,
      name: buckets.name,
      currency: buckets.currency,
      status: buckets.status,
      createdAt: buckets.createdAt,
      type: { id: bucketTypes.id, name: bucketTypes.name },
    })
    .from(buckets)
    .innerJoin(bucketTypes, eq(buckets.typeId, bucketTypes.id))
    .where(ne(buckets.status, "deleted"))
    .all();

  // Current balance per bucket
  const allEntries = db.select().from(ledger).orderBy(ledger.date, ledger.id).all();

  const balanceMap: Record<number, number> = {};
  for (const b of allBuckets) balanceMap[b.id] = 0;
  for (const e of allEntries) {
    if (balanceMap[e.bucketId] !== undefined) {
      balanceMap[e.bucketId] += e.flow === "in" ? e.amount : -e.amount;
    }
  }

  // Build time series snapped to transaction dates (for history chart)
  const dates = [...new Set(allEntries.map((e) => e.date))].sort();
  const runningBalance: Record<number, number> = {};
  for (const b of allBuckets) runningBalance[b.id] = 0;

  const series: Record<string, number | string>[] = [];
  let idx = 0;
  for (const date of dates) {
    while (idx < allEntries.length && allEntries[idx].date === date) {
      const e = allEntries[idx];
      if (runningBalance[e.bucketId] !== undefined) {
        runningBalance[e.bucketId] += e.flow === "in" ? e.amount : -e.amount;
      }
      idx++;
    }
    series.push({ date, ...Object.fromEntries(Object.entries(runningBalance).map(([k, v]) => [k, v])) });
  }

  // Only chart buckets with a non-zero current balance
  const chartBuckets = allBuckets
    .filter((b) => (balanceMap[b.id] ?? 0) !== 0)
    .map((b) => ({ id: b.id, name: b.name, currency: b.currency, currentBalance: balanceMap[b.id] }));

  const allTypes = db.select().from(bucketTypes).all();

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Buckets</h1>
        <CreateBucketDialog bucketTypes={allTypes} />
      </div>

      {chartBuckets.length > 0 && (
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h2 className="text-sm font-medium mb-4">Balance Breakdown</h2>
            <BalancePieChart buckets={chartBuckets} />
          </div>
          <div>
            <h2 className="text-sm font-medium mb-4">Balance History</h2>
            <BalanceHistoryChart buckets={chartBuckets} series={series} />
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allBuckets.map((bucket) => {
            const balance = balanceMap[bucket.id] ?? 0;
            return (
              <TableRow key={bucket.id}>
                <TableCell className="font-medium">
                  <Link href={`/buckets/${bucket.id}`} className="hover:underline">
                    {bucket.name}
                  </Link>
                </TableCell>
                <TableCell className="capitalize">{bucket.type.name}</TableCell>
                <TableCell className="font-mono">{formatCents(balance, bucket.currency)}</TableCell>
                <TableCell>{bucket.currency}</TableCell>
                <TableCell>
                  <Badge variant={bucket.status === "active" ? "default" : "secondary"} className="capitalize">
                    {bucket.status}
                  </Badge>
                </TableCell>
                <TableCell>{bucket.createdAt}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}




