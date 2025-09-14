import { NextResponse } from "next/server";
import { db } from "../../../../../db";
import { buyerHistory } from "../../../../../db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/leads/[id]/history → last 5 changes
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const history = await db
    .select()
    .from(buyerHistory)
    .where(eq(buyerHistory.buyerId, id))
    .orderBy(desc(buyerHistory.changedAt))
    .limit(5);

  return NextResponse.json(history);
}
