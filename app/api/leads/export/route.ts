import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { buyers } from "../../../../db/schema";
import { and, eq, ilike, or, desc } from "drizzle-orm";

// Utility: convert array of objects → CSV string
function toCSV(rows: any[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(","), // header row
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          // Quote fields with commas
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];
  return csvRows.join("\n");
}

// GET /api/leads/export?city=...&status=...&search=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

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

  const rows = await db
    .select()
    .from(buyers)
    .where(and(...conditions))
    .orderBy(desc(buyers.updatedAt));

  const csv = toCSV(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=leads_export.csv",
    },
  });
}
