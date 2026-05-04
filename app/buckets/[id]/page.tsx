export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { buckets, bucketTypes, ledger } from "@/db/schema";
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
    })
    .from(buckets)
    .innerJoin(bucketTypes, eq(buckets.typeId, bucketTypes.id))
    .where(eq(buckets.id, numId))
    .get();

  if (!bucket) notFound();

  const entries = db
    .select()
    .from(ledger)
    .where(eq(ledger.bucketId, numId))
    .orderBy(ledger.date, ledger.id)
    .all();

  // Compute running balance per row
  let running = 0;
  const rows = entries.map((e) => {
    running += e.flow === "in" ? e.amount : -e.amount;
    return { ...e, running };
  });

  const balance = running;

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
          <p className="text-3xl font-mono font-semibold mt-2">
            {formatCents(balance, bucket.currency)}
          </p>
        </div>
        <AddTransactionDialog bucketId={bucket.id} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No transactions yet.
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.note ?? <span className="text-muted-foreground">—</span>}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}

