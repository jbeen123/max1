"use client";

import { useState } from "react";

type QueueItem = {
  id: string;
  title: string;
  county: string;
  state: string;
  askingPrice: number;
  seller: { email: string };
};

export function ModerationQueue({ initialQueue }: { initialQueue: QueueItem[] }) {
  const [queue, setQueue] = useState(initialQueue);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function moderate(propertyId: string, action: "APPROVE" | "REJECT") {
    setBusy(propertyId + action);
    setMsg("");
    const res = await fetch("/api/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, action }),
    });
    const data = await res.json();
    setBusy(null);

    if (!res.ok) {
      setMsg(data?.error || "Moderation failed");
      return;
    }

    setQueue((prev) => prev.filter((q) => q.id !== propertyId));
    setMsg(`${action}D listing ${propertyId.slice(0, 8)}...`);
  }

  return (
    <div className="card">
      <h3>Moderation Queue</h3>
      {queue.length === 0 ? <p>No pending listings.</p> : (
        <ul className="grid" style={{ gap: ".75rem", listStyle: "none", padding: 0 }}>
          {queue.map((q) => (
            <li key={q.id} className="card" style={{ padding: ".8rem" }}>
              <strong>{q.title}</strong>
              <p style={{ margin: ".35rem 0" }}>{q.county}, {q.state} · ${q.askingPrice.toLocaleString()} · seller {q.seller.email}</p>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button disabled={!!busy} onClick={() => moderate(q.id, "APPROVE")}>Approve</button>
                <button disabled={!!busy} className="ghost" onClick={() => moderate(q.id, "REJECT")}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {msg && <p style={{ color: "#93c5fd" }}>{msg}</p>}
    </div>
  );
}
