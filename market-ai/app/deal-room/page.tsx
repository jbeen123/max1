"use client";

import { useEffect, useState } from "react";

type Listing = { id: string; title: string; state: string; county: string; askingPrice: number };
type Offer = {
  id: string;
  propertyId: string;
  amount: number;
  message?: string;
  status: string;
  counterAmount?: number | null;
  counterMessage?: string | null;
};

export default function DealRoomPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const [pRes, oRes] = await Promise.all([fetch("/api/properties"), fetch("/api/offers")]);
    const pData = await pRes.json();
    const oData = await oRes.json();
    setListings(Array.isArray(pData) ? pData : []);
    setOffers(Array.isArray(oData) ? oData : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submitOffer(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMsg(res.ok ? `Offer sent: ${data.id}` : data?.error || "Failed to submit offer");
    await load();
  }

  async function counterOffer(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/offers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMsg(res.ok ? `Counter submitted: ${data.id}` : data?.error || "Failed to counter");
    await load();
  }

  return (
    <section className="grid grid-2">
      <div className="card">
        <h2>Buyer: Submit Offer</h2>
        <form action={submitOffer} className="grid">
          <select name="propertyId" required defaultValue="">
            <option value="" disabled>Select listing</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>{l.title} — {l.county}, {l.state} (${l.askingPrice.toLocaleString()})</option>
            ))}
          </select>
          <input name="amount" type="number" placeholder="Offer amount" required />
          <textarea name="message" placeholder="Optional message" />
          <button type="submit">Submit Offer</button>
        </form>
      </div>

      <div className="card">
        <h2>Seller/Admin: Counter Offer</h2>
        <form action={counterOffer} className="grid">
          <select name="offerId" required defaultValue="">
            <option value="" disabled>Select incoming offer</option>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>{o.id.slice(0, 8)}... · ${o.amount.toLocaleString()} · {o.status}</option>
            ))}
          </select>
          <input name="counterAmount" type="number" placeholder="Counter amount" required />
          <textarea name="counterMessage" placeholder="Counter terms / notes" />
          <button type="submit">Send Counter</button>
        </form>
      </div>

      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <h3>Offer Activity</h3>
        {offers.length === 0 ? <p>No offers yet.</p> : (
          <ul>
            {offers.map((o) => (
              <li key={o.id}>
                {o.id.slice(0, 8)}... | offer ${o.amount.toLocaleString()} | status {o.status}
                {o.counterAmount ? ` | counter $${o.counterAmount.toLocaleString()}` : ""}
              </li>
            ))}
          </ul>
        )}
        {msg && <p>{msg}</p>}
      </div>
    </section>
  );
}
