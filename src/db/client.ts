// src/db/client.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Read the DATABASE_URL from your .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export Drizzle client
export const db = drizzle(pool);
