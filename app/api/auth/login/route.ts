import { NextResponse } from "next/server";
import { loginDemoUser } from "@/lib/session";

export async function POST() {
  const user = loginDemoUser();

  const res = NextResponse.json({ user });
  res.cookies.set("userId", user.id, { httpOnly: true, path: "/" });
  return res;
}
