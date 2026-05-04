import { db } from "@/db";
import { bucketTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, error } from "../../_lib/response";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/bucket-types/[id] — delete a custom bucket type (system types are protected)
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return error("invalid id");

  const type = db.select().from(bucketTypes).where(eq(bucketTypes.id, numId)).get();
  if (!type) return error("not found", 404);
  if (type.isSystem) return error("system bucket types cannot be deleted", 403);

  db.delete(bucketTypes).where(eq(bucketTypes.id, numId)).run();
  return json({ deleted: true });
}

