import { db } from "@/db";
import { buckets, bucketTypes, ledger } from "@/db/schema";
import { eq, ne, sql } from "drizzle-orm";
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

// Formats cents to a readable currency string e.g. 1250 → "$12.50"
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

  // Calculate balance per bucket: SUM(in) - SUM(out) in cents
  const balanceRows = db
    .select({
      bucketId: ledger.bucketId,
      balance: sql<number>`SUM(CASE WHEN flow = 'in' THEN amount ELSE -amount END)`,
    })
    .from(ledger)
    .groupBy(ledger.bucketId)
    .all();

  const balanceMap = Object.fromEntries(balanceRows.map((r) => [r.bucketId, r.balance]));

  const allTypes = db.select().from(bucketTypes).all();

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Buckets</h1>
        <CreateBucketDialog bucketTypes={allTypes} />
      </div>
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
                <TableCell className="font-medium">{bucket.name}</TableCell>
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


