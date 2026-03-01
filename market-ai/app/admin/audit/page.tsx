"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Log = {
  id: string;
  createdAt: string;
  action: string;
  targetType: string;
  targetId: string;
  actorId: string | null;
};

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [stack, setStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  async function load(c?: string | null) {
    const res = await fetch(`/api/admin/audit?pageSize=30&action=${encodeURIComponent(action)}&targetType=${encodeURIComponent(targetType)}${c ? `&cursor=${c}` : ""}`);
    const data = await res.json();
    setLogs(Array.isArray(data?.items) ? data.items : []);
    setNextCursor(data?.nextCursor ?? null);
  }

  useEffect(() => {
    load();
  }, []);

  const csvUrl = `/api/admin/audit?format=csv&action=${encodeURIComponent(action)}&targetType=${encodeURIComponent(targetType)}`;

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <div className="card">
        <h2>Audit Logs</h2>
        <div className="grid grid-3">
          <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Filter action" />
          <input value={targetType} onChange={(e) => setTargetType(e.target.value)} placeholder="Filter target type" />
          <button onClick={() => { setCursor(null); setStack([]); load(null); }}>Apply Filters</button>
        </div>
        <p style={{ marginTop: ".75rem" }}><Link href={csvUrl}>Export CSV</Link></p>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th>Time</th><th>Action</th><th>Target</th><th>Actor</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toISOString()}</td>
                <td>{log.action}</td>
                <td>{log.targetType}:{log.targetId}</td>
                <td>{log.actorId ?? "system"}</td>
                <td><Link href={`/admin/audit/${log.id}`}>open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem" }}>
          <button className="ghost" disabled={stack.length === 0} onClick={() => {
            const copy = [...stack]; const prev = copy.pop() ?? null;
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
