"use client";

import { useState } from "react";

export function KycPanel() {
  const [msg, setMsg] = useState("");

  async function startKyc(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/kyc/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMsg(res.ok ? `KYC session created: ${data.sessionId}` : data?.error || "Failed to create KYC session");
  }

  return (
    <div className="card">
      <h3>KYC / Identity Check</h3>
      <p style={{ color: "#94a3b8" }}>Starter hook for Persona/Stripe Identity/Sumsub integration.</p>
      <form action={startKyc} className="grid">
        <input name="userId" placeholder="User ID" required />
        <input name="provider" placeholder="Provider (persona|stripe_identity|sumsub)" defaultValue="persona" required />
        <button type="submit">Start KYC Session</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
