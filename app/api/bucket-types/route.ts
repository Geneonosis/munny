export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bucketTypes } from "@/db/schema";
import { error, json } from "../_lib/response";

// GET /api/bucket-types — list all bucket types
export async function GET() {
  const types = db.select().from(bucketTypes).all();
  return json(types);
}

// POST /api/bucket-types — create a custom bucket type
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();

  if (!name) return error("name is required");

  const existing = db
    .select()
    .from(bucketTypes)
    .where(eq(bucketTypes.name, name))
    .get();

  if (existing)
    return error("a bucket type with that name already exists", 409);

  const created = db
    .insert(bucketTypes)
    .values({ name, isSystem: false })
    .returning()
    .get();
  return json(created, 201);
}
