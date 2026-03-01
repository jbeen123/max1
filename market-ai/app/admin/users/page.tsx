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

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
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
    await load();
  }

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <div className="card"><h2>Admin · User Management</h2></div>
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
              <input
                type="checkbox"
                defaultChecked={u.isVerified}
                onChange={(e) => updateUser(u.id, u.role, e.target.checked)}
                style={{ width: "auto" }}
              />
              Verified
            </label>
          </div>
        </div>
      ))}
      {msg && <p>{msg}</p>}
    </section>
  );
}
