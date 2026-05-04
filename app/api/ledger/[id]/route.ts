import { db } from "@/db";
import { ledger } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, error } from "../../_lib/response";

type Params = { params: Promise<{ id: string }> };

// GET /api/ledger/[id]
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return error("invalid id");

  const entry = db.select().from(ledger).where(eq(ledger.id, numId)).get();
  if (!entry) return error("not found", 404);
  return json(entry);
}

// PATCH /api/ledger/[id] — update amount, flow, note, or date
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return error("invalid id");

  const existing = db.select().from(ledger).where(eq(ledger.id, numId)).get();
  if (!existing) return error("not found", 404);

  const body = await req.json().catch(() => null);
  const updates: Partial<typeof existing> = {};

  if (body?.amount !== undefined) {
    const amount = Number(body.amount);
    if (isNaN(amount) || amount <= 0) return error("amount must be a positive number (in cents)");
    updates.amount = amount;
  }
  if (body?.flow !== undefined) {
    if (!["in", "out"].includes(body.flow)) return error("flow must be 'in' or 'out'");
    updates.flow = body.flow;
  }
  if (body?.note !== undefined) updates.note = body.note?.trim() ?? null;
  if (body?.date !== undefined) updates.date = String(body.date).trim();

  if (Object.keys(updates).length === 0) return error("no valid fields to update");

  db.update(ledger).set(updates).where(eq(ledger.id, numId)).run();
  return json(db.select().from(ledger).where(eq(ledger.id, numId)).get());
}

// DELETE /api/ledger/[id] — hard delete a ledger entry
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return error("invalid id");

  const existing = db.select().from(ledger).where(eq(ledger.id, numId)).get();
  if (!existing) return error("not found", 404);

  db.delete(ledger).where(eq(ledger.id, numId)).run();
  return json({ deleted: true });
}

