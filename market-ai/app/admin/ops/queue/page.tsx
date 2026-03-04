"use client";

import { useEffect, useState } from "react";

type Job = {
  id: string;
  kind: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  runAfter: string;
  lastError: string | null;
};

export default function OpsQueuePage() {
  const [failed, setFailed] = useState<Job[]>([]);
  const [pending, setPending] = useState<Job[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [policyHistory, setPolicyHistory] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const [list, m, h, ph, pa] = await Promise.all([
      fetch("/api/admin/ops/queue/replay", { method: "GET" }).then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/ops/queue/metrics", { method: "GET" }).then((r) => r.json()).catch(() => null),
      fetch("/api/admin/ops/queue/history", { method: "GET" }).then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/ops/queue/policy-history?queueKey=ATTESTATION_UPLOAD", { method: "GET" }).then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/ops/queue/policy-approvals", { method: "GET" }).then((r) => r.json()).catch(() => ({})),
    ]);
    setFailed(Array.isArray(list?.failed) ? list.failed : []);
    setPending(Array.isArray(list?.pending) ? list.pending : []);
    setMetrics(m);
    setHistory(Array.isArray(h?.items) ? h.items : []);
    setPolicyHistory(Array.isArray(ph?.items) ? ph.items : []);
    setPendingApprovals(Array.isArray(pa?.items) ? pa.items.filter((x: any) => x.status === "PENDING") : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function processNow() {
    const res = await fetch("/api/admin/ops/queue/process?limit=25", { method: "POST" });
    const data = await res.json();
    setMsg(res.ok ? `Processed ${data.results?.length || 0} jobs` : data?.error || "Process failed");
    await load();
  }

  async function replayAllFailed() {
    const res = await fetch("/api/admin/ops/queue/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allFailed: true }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Replayed ${data.replayed} failed jobs` : data?.error || "Replay failed");
    await load();
  }

  async function replayOne(jobId: string) {
    const res = await fetch("/api/admin/ops/queue/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Replayed job ${jobId}` : data?.error || "Replay failed");
    await load();
  }

  async function updatePolicy(formData: FormData) {
    const payload = {
      queueKey: "ATTESTATION_UPLOAD",
      failThreshold: Number(formData.get("failThreshold")),
      openMs: Number(formData.get("openMs")),
      enabled: formData.get("enabled") === "on",
      alertWebhook: String(formData.get("alertWebhook") || "") || null,
      requiredVotes: Number(formData.get("requiredVotes") || 2),
      submitForApproval: true,
    };

    const res = await fetch("/api/admin/ops/queue/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMsg(res.ok ? "Policy change submitted for approval" : data?.error || "Policy update failed");
    await load();
  }

  async function sendTestAlert() {
    const webhookUrl = String(metrics?.policy?.alertWebhook || "");
    const res = await fetch("/api/admin/ops/queue/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queueKey: "ATTESTATION_UPLOAD", message: "Manual test alert", webhookUrl: webhookUrl || undefined }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Alert sent: ${data?.sent?.sent ? "yes" : "no"}` : data?.error || "Alert failed");
  }

  async function approve(id: string) {
    const res = await fetch(`/api/admin/ops/queue/policy-approvals/${id}/approve`, { method: "POST" });
    const data = await res.json();
    setMsg(res.ok ? "Approval applied" : data?.error || "Approve failed");
    await load();
  }

  async function reject(id: string) {
    const res = await fetch(`/api/admin/ops/queue/policy-approvals/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "Rejected from UI" }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Approval rejected" : data?.error || "Reject failed");
    await load();
  }

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <div className="card">
        <h2>Upload Queue (Dead-letter + Replay)</h2>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          <button onClick={processNow}>Process Queue Now</button>
          <button className="ghost" onClick={replayAllFailed}>Replay All Failed</button>
        </div>
        {msg && <p>{msg}</p>}
      </div>

      <div className="card">
        <h3>Queue Metrics (24h)</h3>
        {!metrics ? <p>Loading metrics...</p> : (
          <ul>
            <li>Pending: {metrics.pending}</li>
            <li>Processing: {metrics.processing}</li>
            <li>Failed: {metrics.failed}</li>
            <li>Succeeded (24h): {metrics.succeeded24h}</li>
            <li>Failed (24h): {metrics.failed24h}</li>
            <li>Circuit: {metrics?.circuit?.isOpen ? `OPEN until ${metrics?.circuit?.openUntil}` : "CLOSED"}</li>
            <li>Latency p50/p95/p99 (ms): {metrics?.latencyMs?.p50} / {metrics?.latencyMs?.p95} / {metrics?.latencyMs?.p99}</li>
            <li>Prometheus: <a href="/api/admin/ops/queue/metrics/prometheus" target="_blank">/api/admin/ops/queue/metrics/prometheus</a></li>
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Runtime Queue Policy</h3>
        <form action={updatePolicy} className="grid grid-3">
          <input name="failThreshold" type="number" min={1} max={100} defaultValue={metrics?.policy?.failThreshold ?? 5} />
          <input name="openMs" type="number" min={1000} defaultValue={metrics?.policy?.openMs ?? 300000} />
          <input name="alertWebhook" placeholder="Alert webhook URL" defaultValue={metrics?.policy?.alertWebhook ?? ""} />
          <input name="requiredVotes" type="number" min={1} max={5} defaultValue={2} />
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input name="enabled" type="checkbox" defaultChecked={metrics?.policy?.enabled ?? true} style={{ width: "auto" }} /> Enabled
          </label>
          <button type="submit">Save Policy</button>
          <button type="button" className="ghost" onClick={sendTestAlert}>Send Test Alert</button>
        </form>
      </div>

      <div className="card">
        <h3>Pending Policy Approvals</h3>
        {pendingApprovals.length === 0 ? <p>No pending approvals.</p> : (
          <ul>
            {pendingApprovals.map((e) => (
              <li key={e.id}>
                {new Date(e.createdAt).toLocaleString()} · {e.queueKey} · votes {(e.votes?.length ?? 0)}/{e.requiredVotes} · expires {e.expiresAt ? new Date(e.expiresAt).toLocaleString() : "n/a"}
                <button className="ghost" style={{ width: "auto", marginLeft: ".5rem" }} onClick={() => approve(e.id)}>Approve</button>
                <button className="ghost" style={{ width: "auto", marginLeft: ".5rem" }} onClick={() => reject(e.id)}>Reject</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Policy Change History</h3>
        {policyHistory.length === 0 ? <p>No policy changes yet.</p> : (
          <ul>
            {policyHistory.map((e) => (
              <li key={e.id}>{new Date(e.createdAt).toLocaleString()} · {e.action}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Circuit History</h3>
        {history.length === 0 ? <p>No circuit events.</p> : (
          <ul>
            {history.map((e) => (
              <li key={e.id}>{new Date(e.createdAt).toLocaleString()} · {e.eventType} · {e.reason ?? "-"}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Failed Jobs</h3>
        {failed.length === 0 ? <p>No failed jobs.</p> : (
          <ul>
            {failed.map((j) => (
              <li key={j.id}>
                {j.id.slice(0, 8)}... · {j.kind} · attempts {j.attempts}/{j.maxAttempts} · {j.lastError ?? "n/a"}
                <button className="ghost" style={{ width: "auto", marginLeft: ".5rem" }} onClick={() => replayOne(j.id)}>Replay</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Pending Jobs</h3>
        {pending.length === 0 ? <p>No pending jobs.</p> : (
          <ul>
            {pending.map((j) => (
              <li key={j.id}>{j.id.slice(0, 8)}... · runAfter {new Date(j.runAfter).toLocaleString()} · attempts {j.attempts}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
