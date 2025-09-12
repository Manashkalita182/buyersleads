
// src/pages/buyers/index.tsx
import { GetServerSideProps } from "next";
import { db } from "../../db/client";


import * as schema from "@/db/schema";
import { desc, sql } from "drizzle-orm";

const PAGE_SIZE = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = Number(context.query.page) || 1;
  const offset = (page - 1) * PAGE_SIZE;

  // Count total buyers
  const countRes = await db.select({ count: sql<number>`count(*)` }).from(schema.buyers);
  const totalCount = Number(countRes[0].count);

  // Fetch paginated buyers ordered by updatedAt descending
  const buyersRaw = await db
    .select()
    .from(schema.buyers)
    .orderBy(desc(schema.buyers.updatedAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  // Serialize Date objects
  const buyers = buyersRaw.map((b) => ({
    ...b,
    updatedAt: b.updatedAt.toISOString(),
  }));

  return {
    props: {
      buyers,
      totalCount,
      page,
    },
  };
};

interface BuyersPageProps {
  buyers: typeof schema.buyers[];
  totalCount: number;
  page: number;
}

export default function BuyersPage({ buyers, totalCount, page }: BuyersPageProps) {
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Buyers</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Email</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Phone</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>City</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {buyers.map((b) => (
            <tr key={b.id}>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{b.fullName}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{b.email}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{b.phone}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{b.city}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{b.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        <span>Page {page} of {totalPages}</span>
        <div style={{ marginTop: 10 }}>
          {page > 1 && <a href={`/buyers?page=${page - 1}`} style={{ marginRight: 10 }}>Previous</a>}
          {page < totalPages && <a href={`/buyers?page=${page + 1}`}>Next</a>}
        </div>
      </div>
    </div>
  );
}
