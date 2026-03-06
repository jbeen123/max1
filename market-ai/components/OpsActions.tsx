"use client";

import { useState } from "react";

export function OpsActions() {
  const [msg, setMsg] = useState("");

  async function hit(path: string) {
    const res = await fetch(path, { method: "POST" });
    const data = await res.json();
    setMsg(res.ok ? `OK: ${path}` : data?.error || `Failed: ${path}`);
  }

  return (
    <div className="card">
      <h3>Manual Ops Actions</h3>
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
        <button onClick={() => hit("/api/admin/ops/run-maintenance")}>Run Maintenance</button>
        <button className="ghost" onClick={() => hit("/api/admin/ops/attest-audit")}>Create Attestation</button>
        <button className="ghost" onClick={() => hit("/api/admin/ops/attest-audit/upload")}>Upload Attestation</button>
        <button className="ghost" onClick={() => hit("/api/admin/ops/queue/policy-approvals/expire")}>Expire Stale Approvals</button>
      </div>
      {msg && <p>{msg}</p>}
    </div>
  );
}
