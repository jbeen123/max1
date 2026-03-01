"use client";

import { useEffect, useState } from "react";

type Invite = {
  id: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  token: string;
  createdAt: string;
  expiresAt: string;
  consumedAt: string | null;
};

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/admin/invites");
    const data = await res.json();
    setInvites(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createInvite(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMsg(res.ok ? `Invite URL: ${data.inviteUrl}` : data?.error || "Invite failed");
    await load();
  }

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <div className="card">
        <h2>Admin · Invite Flow</h2>
        <form action={createInvite} className="grid grid-3">
          <input name="email" type="email" placeholder="Invite email" required />
          <select name="role" defaultValue="SELLER">
            <option value="BUYER">BUYER</option>
            <option value="SELLER">SELLER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <input name="expiresInHours" type="number" defaultValue={72} min={1} max={720} />
          <button type="submit">Create Invite</button>
        </form>
        {msg && <p style={{ wordBreak: "break-all" }}>{msg}</p>}
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Email</th>
              <th style={{ textAlign: "left" }}>Role</th>
              <th style={{ textAlign: "left" }}>Expires</th>
              <th style={{ textAlign: "left" }}>Consumed</th>
              <th style={{ textAlign: "left" }}>Token</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((i) => (
              <tr key={i.id}>
                <td>{i.email}</td>
                <td>{i.role}</td>
                <td>{new Date(i.expiresAt).toLocaleString()}</td>
                <td>{i.consumedAt ? new Date(i.consumedAt).toLocaleString() : "No"}</td>
                <td>{i.token.slice(0, 12)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
