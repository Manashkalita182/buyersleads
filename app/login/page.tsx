"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch("/api/auth/login", { method: "POST" });
    if (res.ok) router.push("/leads");
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
      <h1>Demo Login</h1>
      <p>Click below to log in as demo user.</p>
      <button
        onClick={handleLogin}
        style={{ padding: "10px 20px", background: "blue", color: "white" }}
      >
        Login as Demo User
      </button>
    </div>
  );
}
