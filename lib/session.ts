// lib/session.ts
import { cookies } from "next/headers";

export async function getCurrentUser() {
  const cookieStore = await cookies();   // ✅ must await
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return null;
  return { id: userId };
}
