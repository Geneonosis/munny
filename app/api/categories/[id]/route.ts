export const dynamic = "force-dynamic";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, error } from "../../_lib/response";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/categories/[id] — custom categories only
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return error("invalid id");

  const cat = db.select().from(categories).where(eq(categories.id, numId)).get();
  if (!cat) return error("not found", 404);
  if (cat.isSystem) return error("system categories cannot be deleted", 403);

  db.delete(categories).where(eq(categories.id, numId)).run();
  return json({ deleted: true });
}

