"use client";

import { useState } from "react";

export default function SubmitPage() {
  const [msg, setMsg] = useState("");

  async function onSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMsg(data?.id ? `Created listing: ${data.id}` : data?.error || "Something went wrong");
  }

  return (
    <section className="card">
      <h2>Submit Property</h2>
      <form action={onSubmit} className="grid">
        <input name="sellerId" placeholder="Seller ID" required />
        <input name="title" placeholder="Property title" required />
        <textarea name="description" placeholder="Describe property" required />
        <div className="grid grid-2">
          <input name="state" placeholder="State (e.g., FL)" required />
          <input name="county" placeholder="County" required />
        </div>
        <div className="grid grid-2">
          <input name="askingPrice" type="number" placeholder="Asking price" required />
          <input name="lotSizeAcres" type="number" step="0.01" placeholder="Lot size acres" />
        </div>
        <label style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          <input name="assignmentAllowed" type="checkbox" /> Assignment opportunity
        </label>
        <button type="submit">Create Listing</button>
      </form>
      {msg && <p style={{ marginTop: "1rem" }}>{msg}</p>}
    </section>
  );
}
