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
  revokedAt?: string | null;
};

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [msg, setMsg] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [stack, setStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const pageSize = 20;

  async function load(c?: string | null) {
    const res = await fetch(`/api/admin/invites?pageSize=${pageSize}${c ? `&cursor=${c}` : ""}`);
    const data = await res.json();
    setInvites(Array.isArray(data?.items) ? data.items : []);
    setNextCursor(data?.nextCursor ?? null);
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
    await load(cursor);
  }

  async function actionInvite(inviteId: string, action: "revoke" | "resend") {
    const res = await fetch("/api/admin/invites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId, action }),
    });
    const data = await res.json();
    setMsg(res.ok ? `${action} ok` : data?.error || `${action} failed`);
    await load(cursor);
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
            <tr><th>Email</th><th>Role</th><th>Expires</th><th>State</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {invites.map((i) => (
              <tr key={i.id}>
                <td>{i.email}</td><td>{i.role}</td><td>{new Date(i.expiresAt).toLocaleString()}</td>
                <td>{i.revokedAt ? "revoked" : i.consumedAt ? "consumed" : "open"}</td>
                <td style={{ display: "flex", gap: ".5rem" }}>
                  <button className="ghost" onClick={() => actionInvite(i.id, "resend")}>Resend</button>
                  <button className="ghost" onClick={() => actionInvite(i.id, "revoke")}>Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem" }}>
          <button className="ghost" disabled={stack.length === 0} onClick={() => {
            const copy = [...stack];
            const prev = copy.pop() ?? null;
            setStack(copy); setCursor(prev); load(prev);
          }}>Prev</button>
          <button className="ghost" disabled={!nextCursor} onClick={() => {
            setStack((s) => [...s, cursor ?? ""]); setCursor(nextCursor); load(nextCursor);
          }}>Next</button>
        </div>
      </div>
    </section>
  );
}
