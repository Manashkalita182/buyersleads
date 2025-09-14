import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { buyers, buyerHistory } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session"; // ✅ session helper

// GET /api/leads/[id] → fetch single lead
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ await params
  const [lead] = await db.select().from(buyers).where(eq(buyers.id, id));
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

// PATCH /api/leads/[id] → update + log history
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ await params
  const body = await req.json();

  // ✅ Check logged-in user
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  // Fetch old lead
  const [oldLead] = await db.select().from(buyers).where(eq(buyers.id, id));
  if (!oldLead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ✅ Ownership enforcement
  if (oldLead.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update
  const [updated] = await db
    .update(buyers)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(buyers.id, id))
    .returning();

  // Build diff for history
  const diff: Record<string, { old: any; new: any }> = {};
  for (const key in body) {
    if (body[key] !== oldLead[key]) {
      diff[key] = { old: oldLead[key], new: body[key] };
    }
  }

  if (Object.keys(diff).length > 0) {
    await db.insert(buyerHistory).values({
      buyerId: id,
      changedBy: user.id, // ✅ always current user
      diff,
    });
  }

  return NextResponse.json(updated);
}
