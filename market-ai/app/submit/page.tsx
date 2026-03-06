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
    setMsg(data?.id ? `Submitted for moderation: ${data.id}` : data?.error || "Something went wrong");
  }

  return (
    <section className="card">
      <h2>Submit Property</h2>
      <p style={{ color: "#94a3b8" }}>You must be logged in as Seller/Admin. New listings enter moderation queue.</p>
      <form action={onSubmit} className="grid">
        <input name="title" placeholder="Property title" required />
        <textarea name="description" placeholder="Describe property" required />
        <div className="grid grid-2">
          <input name="state" placeholder="State (e.g., FL)" maxLength={2} required />
          <input name="county" placeholder="County" required />
        </div>
        <div className="grid grid-2">
          <input name="askingPrice" type="number" placeholder="Asking price" required />
          <input name="lotSizeAcres" type="number" step="0.01" placeholder="Lot size acres" />
        </div>

        <h3 style={{ marginBottom: 0 }}>Public Seller Info</h3>
        <div className="grid grid-2">
          <input name="sellerDisplayName" placeholder="Seller display name" />
          <input name="sellerPublicContact" placeholder="Public contact (email/phone)" />
        </div>

        <h3 style={{ marginBottom: 0 }}>Public Land Details</h3>
        <div className="grid grid-2">
          <input name="city" placeholder="City" />
          <input name="zipCode" placeholder="ZIP code" />
        </div>
        <div className="grid grid-2">
          <input name="parcelId" placeholder="Parcel / APN" />
          <input name="zoning" placeholder="Zoning" />
        </div>
        <div className="grid grid-2">
          <input name="annualTaxes" type="number" placeholder="Annual taxes (USD)" />
          <input name="hoa" placeholder="HOA / restrictions" />
        </div>
        <div className="grid grid-2">
          <input name="roadAccess" placeholder="Road access" />
          <input name="utilities" placeholder="Utilities available" />
        </div>
        <input name="floodZone" placeholder="Flood zone" />

        <label style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          <input name="assignmentAllowed" type="checkbox" style={{ width: "auto" }} /> Assignment opportunity
        </label>
        <button type="submit">Submit Listing</button>
      </form>
      {msg && <p style={{ marginTop: "1rem" }}>{msg}</p>}
    </section>
  );
}
