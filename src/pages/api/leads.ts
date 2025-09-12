
import { NextApiRequest, NextApiResponse } from "next";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../db/schema";
import { z } from "zod";

// Connect to Supabase Postgres
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Zod validation
const leadSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(10).max(15),
  city: z.enum(["Chandigarh","Mohali","Zirakpur","Panchkula","Other"]),
  propertyType: z.enum(["Apartment","Villa","Plot","Office","Retail"]),
  bhk: z.string().optional().nullable(),
  purpose: z.enum(["Buy","Rent"]),
  timeline: z.enum(["0-3m","3-6m",">6m","Exploring"]),
  source: z.enum(["Website","Referral","Walk-in","Call","Other"]),
  budgetMin: z.number().optional().nullable(),
  budgetMax: z.number().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  ownerId: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const parsed = leadSchema.parse(req.body);

    const inserted = await db.insert(schema.buyers).values(parsed).returning();

    res.status(201).json(inserted);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors.map((e: any) => e.message).join(", ") });
    }
    res.status(500).json({ error: err.message });
  }
}
