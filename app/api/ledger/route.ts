import { db } from "@/db";
import { ledger, buckets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, error } from "../_lib/response";

// GET /api/ledger?bucketId=1 — list entries, optionally filtered by bucket
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bucketId = searchParams.get("bucketId");

  const query = db
    .select()
    .from(ledger)
    .orderBy(ledger.date);

  const results = bucketId
    ? query.where(eq(ledger.bucketId, Number(bucketId))).all()
    : query.all();

  return json(results);
}

// POST /api/ledger — create a ledger entry
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const bucketId = Number(body?.bucketId);
  const amount = Number(body?.amount);
  const flow = body?.flow;
  const note = body?.note?.trim() ?? null;
  const date = body?.date?.trim();

  if (!bucketId || isNaN(bucketId)) return error("bucketId is required");
  if (!amount || isNaN(amount) || amount <= 0) return error("amount must be a positive number (in cents)");
  if (!["in", "out"].includes(flow)) return error("flow must be 'in' or 'out'");
  if (!date) return error("date is required (YYYY-MM-DD)");

  const bucket = db.select().from(buckets).where(eq(buckets.id, bucketId)).get();
  if (!bucket) return error("bucket not found", 404);

  const created = db
    .insert(ledger)
    .values({ bucketId, amount, flow, note, date })
    .returning()
    .get();

  return json(created, 201);
}

