export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { error, json } from "../_lib/response";

// GET /api/categories
export async function GET() {
  return json(db.select().from(categories).all());
}

// POST /api/categories — create a custom category
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return error("name is required");

  const existing = db
    .select()
    .from(categories)
    .where(eq(categories.name, name))
    .get();
  if (existing) return error("a category with that name already exists", 409);

  const created = db
    .insert(categories)
    .values({ name, isSystem: false })
    .returning()
    .get();
  return json(created, 201);
}
