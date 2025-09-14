import { cookies } from "next/headers";

export function getCurrentUser() {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return null;

  return { id: userId }; // later you could add roles etc.
}

export function loginDemoUser() {
  // always return demo user
  return { id: process.env.DEMO_USER_ID! };
}
