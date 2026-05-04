import { db } from "@/db";
import { buckets, bucketTypes } from "@/db/schema";
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
            <TableHead>Currency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allBuckets.map((bucket) => (
            <TableRow key={bucket.id}>
              <TableCell className="font-medium">{bucket.name}</TableCell>
              <TableCell className="capitalize">{bucket.type.name}</TableCell>
              <TableCell>{bucket.currency}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    bucket.status === "active"
                      ? "default"
                      : "secondary"
                  }
                  className="capitalize"
                >
                  {bucket.status}
                </Badge>
              </TableCell>
              <TableCell>{bucket.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}


