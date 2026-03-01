"use client";

import { useState } from "react";

export function IntegrationsPanel() {
  const [esignMsg, setEsignMsg] = useState("");
  const [payMsg, setPayMsg] = useState("");

  async function createEnvelope(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/esign/envelope", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setEsignMsg(res.ok ? `Envelope ready: ${data.envelopeId}` : data?.error || "Failed to create envelope");
  }

  async function createPaymentIntent(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/payments/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setPayMsg(res.ok ? `Payment intent: ${data.intentId}` : data?.error || "Failed to create payment intent");
  }

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3>E-sign Integration</h3>
        <form action={createEnvelope} className="grid">
          <input name="propertyId" placeholder="Property ID" required />
          <input name="buyerEmail" type="email" placeholder="Buyer email" required />
          <input name="sellerEmail" type="email" placeholder="Seller email" required />
          <select name="provider" defaultValue="docusign">
            <option value="docusign">DocuSign</option>
            <option value="dropbox_sign">Dropbox Sign</option>
          </select>
          <button type="submit">Create Envelope</button>
        </form>
        {esignMsg && <p>{esignMsg}</p>}
      </div>

      <div className="card">
        <h3>Earnest Money (Stripe)</h3>
        <form action={createPaymentIntent} className="grid">
          <input name="propertyId" placeholder="Property ID" required />
          <input name="amount" type="number" placeholder="Amount (USD cents)" required />
          <input name="currency" placeholder="Currency" defaultValue="usd" required />
          <button type="submit">Create Payment Intent</button>
        </form>
        {payMsg && <p>{payMsg}</p>}
      </div>
    </div>
  );
}
