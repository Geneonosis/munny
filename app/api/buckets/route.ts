export const dynamic = "force-dynamic";

import { db } from "@/db";
import { buckets, bucketTypes } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { json, error } from "../_lib/response";

// GET /api/buckets — list all non-deleted buckets
export async function GET() {
  const results = db
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
    .where(ne(buckets.status, "deleted"))
    .all();

  return json(results);
}

// POST /api/buckets — create a new bucket
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const typeId = Number(body?.typeId);
  const currency = body?.currency?.trim() ?? "USD";

  if (!name) return error("name is required");
  if (!typeId || isNaN(typeId)) return error("typeId is required");

  const type = db.select().from(bucketTypes).where(eq(bucketTypes.id, typeId)).get();
  if (!type) return error("bucket type not found", 404);

  const created = db
    .insert(buckets)
    .values({ name, typeId, currency })
    .returning()
    .get();

  return json(created, 201);
}

