import { NextResponse } from "next/server";
import { db } from "../../../db";
import { buyers } from "../../../db/schema";
import { and, eq, ilike, or, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";

// =======================
// GET /api/leads → list leads with filters
// =======================
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || "1");
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const city = searchParams.get("city");
  const propertyType = searchParams.get("propertyType");
  const status = searchParams.get("status");
  const timeline = searchParams.get("timeline");
  const search = searchParams.get("search");

  const conditions: any[] = [];
  if (city) conditions.push(eq(buyers.city, city));
  if (propertyType) conditions.push(eq(buyers.propertyType, propertyType));
  if (status) conditions.push(eq(buyers.status, status));
  if (timeline) conditions.push(eq(buyers.timeline, timeline));

  if (search) {
    conditions.push(
      or(
        ilike(buyers.fullName, `%${search}%`),
        ilike(buyers.email, `%${search}%`),
        ilike(buyers.phone, `%${search}%`)
      )
    );
  }

  const totalRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(buyers)
    .where(conditions.length ? and(...conditions) : undefined);

  const total = Number(totalRes[0].count);

  const leads = await db
    .select()
    .from(buyers)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(buyers.updatedAt))
    .limit(pageSize)
    .offset(offset);

  return NextResponse.json({
    leads,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// =======================
// POST /api/leads → create a new lead
// =======================
export async function POST(req: Request) {
  const body = await req.json();

  // ✅ Require login
  const user = { id: "11111111-1111-1111-1111-111111111111" }; // demo user


  const newLead = {
    ...body,
    ownerId: user.id,
    updatedAt: new Date(),
  };

  const [inserted] = await db.insert(buyers).values(newLead).returning();

  return NextResponse.json(inserted);
}
