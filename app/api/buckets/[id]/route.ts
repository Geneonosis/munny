export const dynamic = "force-dynamic";

import { db } from "@/db";
import { buckets, bucketTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, error } from "../../_lib/response";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = ["active", "archived", "deactivated", "deleted"] as const;

function getBucket(id: number) {
  return db
    .select({
      id: buckets.id,
      name: buckets.name,
      currency: buckets.currency,
      status: buckets.status,
      createdAt: buckets.createdAt,
      updatedAt: buckets.updatedAt,
      type: {
        id: bucketTypes.id,
        name: bucketTypes.name,
        isSystem: bucketTypes.isSystem,
      },
    })
    .from(buckets)
    .innerJoin(bucketTypes, eq(buckets.typeId, bucketTypes.id))
    .where(eq(buckets.id, id))
    .get();
}

// GET /api/buckets/[id]
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return error("invalid id");

  const bucket = getBucket(numId);
  if (!bucket) return error("not found", 404);
  return json(bucket);
}

// PATCH /api/buckets/[id] — update name, currency, typeId, or status
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return error("invalid id");

  const existing = db.select().from(buckets).where(eq(buckets.id, numId)).get();
  if (!existing) return error("not found", 404);

  const body = await req.json().catch(() => null);
  const updates: Partial<typeof existing> = {};

  if (body?.name !== undefined) updates.name = String(body.name).trim();
  if (body?.currency !== undefined) updates.currency = String(body.currency).trim();
  if (body?.typeId !== undefined) {
    const typeId = Number(body.typeId);
    if (isNaN(typeId)) return error("invalid typeId");
    const type = db.select().from(bucketTypes).where(eq(bucketTypes.id, typeId)).get();
    if (!type) return error("bucket type not found", 404);
    updates.typeId = typeId;
  }
  if (body?.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return error(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) return error("no valid fields to update");

  updates.updatedAt = new Date().toISOString();

  db.update(buckets).set(updates).where(eq(buckets.id, numId)).run();
  return json(getBucket(numId));
}

// DELETE /api/buckets/[id] — hard delete (sets status to "deleted")
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return error("invalid id");

  const existing = db.select().from(buckets).where(eq(buckets.id, numId)).get();
  if (!existing) return error("not found", 404);

  db.update(buckets)
    .set({ status: "deleted", updatedAt: new Date().toISOString() })
    .where(eq(buckets.id, numId))
    .run();

  return json({ deleted: true });
}

