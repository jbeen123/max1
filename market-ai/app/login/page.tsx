"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  async function onSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());

    // Keep legacy account bootstrap endpoint for first-time users.
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await signIn("credentials", {
      email: String(payload.email),
      role: String(payload.role),
      redirect: false,
    });

    if (result?.error) {
      setMsg("Login failed. Check email/role and try again.");
      return;
    }

    const next = searchParams.get("next") || "/dashboard";
    setMsg("Logged in successfully.");
    router.push(next);
    router.refresh();
  }

  return (
    <section className="card" style={{ maxWidth: 520, margin: "2rem auto" }}>
      <h2>Login / Create Account</h2>
      <p style={{ color: "#94a3b8" }}>Auth.js credentials flow with legacy bootstrap for first login.</p>
      <form action={onSubmit} className="grid">
        <input name="name" placeholder="Name (optional)" />
        <input name="email" type="email" placeholder="Email" required />
        <select name="role" required defaultValue="SELLER">
          <option value="SELLER">Seller</option>
          <option value="BUYER">Buyer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <input name="state" placeholder="State code (e.g., FL)" maxLength={2} />
        <button type="submit">Continue</button>
      </form>
      {msg && <p style={{ marginTop: ".75rem" }}>{msg}</p>}
    </section>
  );
}
