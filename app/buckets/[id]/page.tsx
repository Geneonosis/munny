export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { BucketBalanceHistoryChart } from "@/components/bucket-balance-history-chart";
import { LedgerSankeyChart } from "@/components/ledger-sankey-chart";
import { LedgerTable } from "@/components/ledger-table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { buckets, bucketTypes, categories, ledger } from "@/db/schema";

function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100
  );
}

type Params = { params: Promise<{ id: string }> };

export default async function BucketPage({ params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) notFound();

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

  // Compute running balance per row in ascending (chronological) order
  const rowsAsc = entries.reduce<
    Array<(typeof entries)[number] & { running: number }>
  >((acc, e) => {
    const prev = acc.at(-1)?.running ?? 0;
    acc.push({
      ...e,
      running: prev + (e.flow === "in" ? e.amount : -e.amount),
    });
    return acc;
  }, []);

  // Most recent first for the ledger table display
  const rows = [...rowsAsc].reverse();

  const balance = rowsAsc.at(-1)?.running ?? 0;

  return (
    <main className="p-8">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
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
            <Badge
              variant={bucket.status === "active" ? "default" : "secondary"}
              className="capitalize"
            >
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
        <AddTransactionDialog
          bucketId={bucket.id}
          availableCategories={allCategories}
          currentBalance={balance}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border p-6">
          <h2 className="text-sm font-semibold mb-4">Monthly Flow</h2>
          <LedgerSankeyChart rows={rowsAsc} />
        </div>
        <div className="rounded-xl border p-6">
          <h2 className="text-sm font-semibold mb-4">Balance History</h2>
          <BucketBalanceHistoryChart
            series={Object.values(
              rowsAsc.reduce<Record<string, { date: string; balance: number }>>(
                (acc, r) => {
                  acc[r.date] = { date: r.date, balance: r.running };
                  return acc;
                },
                {}
              )
            )}
          />
        </div>
      </div>

      <LedgerTable
        rows={rows}
        currency={bucket.currency}
        availableCategories={allCategories}
      />
    </main>
  );
}
