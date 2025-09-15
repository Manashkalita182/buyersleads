// src/db/client.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema"; // ✅ relative path (same folder)

// Read the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export Drizzle client with schema
export const db = drizzle(pool, { schema });
