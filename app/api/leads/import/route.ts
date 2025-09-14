
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { db } from "../../../../db";
import { buyers } from "../../../../db/schema";
import { z } from "zod";

const rowSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  notes: z.string().max(1000).optional(),
  tags: z.string().optional(),
  status: z.enum([
    "New",
    "Qualified",
    "Contacted",
    "Visited",
    "Negotiation",
    "Converted",
    "Dropped",
  ]).optional(),
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse(text, { header: true });
    const rows = parsed.data as any[];

    if (rows.length > 200) {
      return NextResponse.json({ error: "Max 200 rows allowed" }, { status: 400 });
    }

    const validRows: any[] = [];
    const errors: { row: number; error: string }[] = [];

    rows.forEach((row, idx) => {
      const result = rowSchema.safeParse(row);
      if (result.success) {
        validRows.push({
          ...result.data,
          tags: result.data.tags ? result.data.tags.split(",") : [],
          updatedAt: new Date(),
          ownerId: "11111111-1111-1111-1111-111111111111",
        });
      } else {
        errors.push({ row: idx + 2, error: result.error.errors[0].message });
      }
    });

    if (validRows.length > 0) {
      await db.insert(buyers).values(validRows);
    }

    return NextResponse.json({ inserted: validRows.length, errors });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
