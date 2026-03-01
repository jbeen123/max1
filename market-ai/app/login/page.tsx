"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setMsg(data?.error ?? "Login failed");
      return;
    }

    setMsg(`Logged in as ${data.user.email} (${data.user.role})`);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="card" style={{ maxWidth: 520, margin: "2rem auto" }}>
      <h2>Login / Create Account</h2>
      <p style={{ color: "#94a3b8" }}>MVP auth (email + role). Replace with Clerk/Auth.js for production.</p>
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
