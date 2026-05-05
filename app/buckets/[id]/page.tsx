export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { buckets, bucketTypes, categories, ledger } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { LedgerSankeyChart } from "@/components/ledger-sankey-chart";
import { BucketBalanceHistoryChart } from "@/components/bucket-balance-history-chart";

function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

type Params = { params: Promise<{ id: string }> };

export default async function BucketPage({ params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) notFound();

  const bucket = db
    .select({
      id: buckets.id,
      name: buckets.name,
      currency: buckets.currency,
      status: buckets.status,
      createdAt: buckets.createdAt,
      type: bucketTypes.name,
      kind: bucketTypes.kind,
    })
    .from(buckets)
    .innerJoin(bucketTypes, eq(buckets.typeId, bucketTypes.id))
    .where(eq(buckets.id, numId))
    .get();

  if (!bucket) notFound();

  const entries = db
    .select({
      id: ledger.id,
      amount: ledger.amount,
      flow: ledger.flow,
      note: ledger.note,
      date: ledger.date,
      categoryId: ledger.categoryId,
      categoryName: categories.name,
    })
    .from(ledger)
    .leftJoin(categories, eq(ledger.categoryId, categories.id))
    .where(eq(ledger.bucketId, numId))
    .orderBy(ledger.date, ledger.id)
    .all();

  const allCategories = db.select().from(categories).all();

  // Compute running balance per row immutably
  const rows = entries.reduce<Array<typeof entries[number] & { running: number }>>(
    (acc, e) => {
      const prev = acc.at(-1)?.running ?? 0;
      return [...acc, { ...e, running: prev + (e.flow === "in" ? e.amount : -e.amount) }];
    },
    []
  );

  const balance = rows.at(-1)?.running ?? 0;

  return (
    <main className="p-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Buckets
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{bucket.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="capitalize">{bucket.type}</span>
            <span>·</span>
            <span>{bucket.currency}</span>
            <span>·</span>
            <Badge variant={bucket.status === "active" ? "default" : "secondary"} className="capitalize">
              {bucket.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {bucket.kind === "liability" ? "Amount Owed" : "Current Balance"}
          </p>
          <p className="text-3xl font-mono font-semibold">
            {formatCents(balance, bucket.currency)}
          </p>
        </div>
        <AddTransactionDialog bucketId={bucket.id} availableCategories={allCategories} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border p-6">
          <h2 className="text-sm font-semibold mb-4">Monthly Flow</h2>
          <LedgerSankeyChart rows={rows} />
        </div>
        <div className="rounded-xl border p-6">
          <h2 className="text-sm font-semibold mb-4">Balance History</h2>
          <BucketBalanceHistoryChart
            series={rows.map((r) => ({ date: r.date, balance: r.running }))}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No transactions yet.
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.note ?? <span className="text-muted-foreground">—</span>}</TableCell>
              <TableCell className="capitalize">
                {row.categoryName ?? <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                <Badge variant={row.flow === "in" ? "default" : "secondary"}>
                  {row.flow === "in" ? "In" : "Out"}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">
                {row.flow === "out" && "-"}
                {formatCents(row.amount, bucket.currency)}
              </TableCell>
              <TableCell className="font-mono">{formatCents(row.running, bucket.currency)}</TableCell>
              <TableCell>
                <EditTransactionDialog row={row} availableCategories={allCategories} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
