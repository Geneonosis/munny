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
import { EditBucketDialog } from "@/components/edit-bucket-dialog";
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
      type: { id: bucketTypes.id, name: bucketTypes.name, kind: bucketTypes.kind },
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

  // Split into assets and liabilities
  const assetBuckets = allBuckets.filter((b) => b.type.kind === "asset");
  const liabilityBuckets = allBuckets.filter((b) => b.type.kind === "liability");

  const totalAssets = assetBuckets.reduce((s, b) => s + (balanceMap[b.id] ?? 0), 0);
  const totalLiabilities = liabilityBuckets.reduce((s, b) => s + (balanceMap[b.id] ?? 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Build time series snapped to transaction dates (for history chart — assets only)
  const dates = [...new Set(allEntries.map((e) => e.date))].sort();
  const runningBalance: Record<number, number> = {};
  for (const b of assetBuckets) runningBalance[b.id] = 0;

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

  // Only chart asset buckets with a non-zero current balance
  const chartBuckets = assetBuckets
    .filter((b) => (balanceMap[b.id] ?? 0) !== 0)
    .map((b) => ({ id: b.id, name: b.name, currency: b.currency, currentBalance: balanceMap[b.id] }));

  const allTypes = db.select().from(bucketTypes).all();

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Buckets</h1>
        <CreateBucketDialog bucketTypes={allTypes} />
      </div>

      {/* Net Worth Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Assets</p>
          <p className="text-2xl font-mono font-semibold">{formatCents(totalAssets)}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Liabilities</p>
          <p className="text-2xl font-mono font-semibold">{formatCents(totalLiabilities)}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Net Worth</p>
          <p className="text-2xl font-mono font-semibold">{formatCents(netWorth)}</p>
        </div>
      </div>

      {chartBuckets.length > 0 && (
        <div className="grid grid-cols-3 gap-8 mb-10">
          <div className="col-span-1">
            <h2 className="text-sm font-medium mb-4">Asset Breakdown</h2>
            <BalancePieChart buckets={chartBuckets} />
          </div>
          <div className="col-span-2">
            <h2 className="text-sm font-medium mb-4">Asset Balance History</h2>
            <BalanceHistoryChart buckets={chartBuckets} series={series} />
          </div>
        </div>
      )}

      {/* Assets Table */}
      <h2 className="text-lg font-semibold mb-3">Assets</h2>
      <Table className="mb-10">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assetBuckets.map((bucket) => {
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
                <TableCell>
                  <EditBucketDialog bucket={bucket} bucketTypes={allTypes} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Liabilities Table */}
      <h2 className="text-lg font-semibold mb-3">Liabilities</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount Owed</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {liabilityBuckets.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No liabilities recorded.
              </TableCell>
            </TableRow>
          )}
          {liabilityBuckets.map((bucket) => {
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
                <TableCell>
                  <EditBucketDialog bucket={bucket} bucketTypes={allTypes} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}
