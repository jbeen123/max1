"use client";

import { useEffect, useState } from "react";

type UserItem = {
  id: string;
  email: string;
  name: string | null;
  role: "BUYER" | "SELLER" | "ADMIN";
  isVerified: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [msg, setMsg] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [stack, setStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const pageSize = 20;

  async function load(c?: string | null, resetStack = false) {
    const res = await fetch(`/api/admin/users?pageSize=${pageSize}&q=${encodeURIComponent(q)}${c ? `&cursor=${c}` : ""}`);
    const data = await res.json();
    setUsers(Array.isArray(data?.items) ? data.items : []);
    setNextCursor(data?.nextCursor ?? null);
    if (resetStack) setStack([]);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateUser(userId: string, role: UserItem["role"], isVerified: boolean) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role, isVerified }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Updated ${data.email}` : data?.error || "Update failed");
    await load(cursor);
  }

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <div className="card grid" style={{ gap: ".75rem" }}>
        <h2>Admin · User Management</h2>
        <div className="grid grid-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email/name" />
          <button onClick={() => { setCursor(null); load(null, true); }}>Search</button>
        </div>
      </div>
      {users.map((u) => (
        <div key={u.id} className="card grid" style={{ gap: ".5rem" }}>
          <strong>{u.email}</strong>
          <small>{u.name ?? "No name"} · created {new Date(u.createdAt).toLocaleString()}</small>
          <div className="grid grid-3">
            <select defaultValue={u.role} onChange={(e) => updateUser(u.id, e.target.value as UserItem["role"], u.isVerified)}>
              <option value="BUYER">BUYER</option>
              <option value="SELLER">SELLER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <input type="checkbox" defaultChecked={u.isVerified} onChange={(e) => updateUser(u.id, u.role, e.target.checked)} style={{ width: "auto" }} />
              Verified
            </label>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: ".5rem" }}>
        <button className="ghost" disabled={stack.length === 0} onClick={() => {
          const copy = [...stack];
          const prev = copy.pop() ?? null;
          setStack(copy);
          setCursor(prev);
          load(prev);
        }}>Prev</button>
        <button className="ghost" disabled={!nextCursor} onClick={() => {
          setStack((s) => [...s, cursor ?? ""]);
          setCursor(nextCursor);
          load(nextCursor);
        }}>Next</button>
      </div>
      {msg && <p>{msg}</p>}
    </section>
  );
}
