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

type PolicyTeam = {
  id: string;
  name: string;
  slug: string;
  role: "REQUESTER" | "APPROVER";
  members: { id: string; email: string | null; domain: string | null }[];
};

type WebhookKey = {
  kid: string;
  source: "db" | "env";
  isActive: boolean;
  createdAt: string | null;
  revokedAt: string | null;
};

export default function OpsQueuePage() {
  const [failed, setFailed] = useState<Job[]>([]);
  const [pending, setPending] = useState<Job[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [policyHistory, setPolicyHistory] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [teams, setTeams] = useState<PolicyTeam[]>([]);
  const [webhookKeys, setWebhookKeys] = useState<WebhookKey[]>([]);
  const [webhookHealth, setWebhookHealth] = useState<any>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamSlug, setNewTeamSlug] = useState("");
  const [newTeamRole, setNewTeamRole] = useState<"REQUESTER" | "APPROVER">("APPROVER");
  const [newMemberInputs, setNewMemberInputs] = useState<Record<string, string>>({});
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [newKeyKid, setNewKeyKid] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const [list, m, h, ph, pa, teamsRes, keysRes] = await Promise.all([
      fetch("/api/admin/ops/queue/replay", { method: "GET" }).then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/ops/queue/metrics", { method: "GET" }).then((r) => r.json()).catch(() => null),
      fetch("/api/admin/ops/queue/history", { method: "GET" }).then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/ops/queue/policy-history?queueKey=ATTESTATION_UPLOAD", { method: "GET" }).then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/ops/queue/policy-approvals", { method: "GET" }).then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/ops/queue/teams", { method: "GET" }).then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/ops/queue/webhook-keys", { method: "GET" }).then((r) => r.json()).catch(() => ({})),
    ]);
    setFailed(Array.isArray(list?.failed) ? list.failed : []);
    setPending(Array.isArray(list?.pending) ? list.pending : []);
    setMetrics(m);
    setHistory(Array.isArray(h?.items) ? h.items : []);
    setPolicyHistory(Array.isArray(ph?.items) ? ph.items : []);
    setPendingApprovals(Array.isArray(pa?.items) ? pa.items.filter((x: any) => x.status === "PENDING") : []);
    setTeams(Array.isArray(teamsRes?.teams) ? teamsRes.teams : []);
    setWebhookKeys(Array.isArray(keysRes?.keys) ? keysRes.keys : []);
  }

  useEffect(() => { load(); }, []);

  // ── Queue actions ──────────────────────────────────────────────────────

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

  // ── Team actions ───────────────────────────────────────────────────────

  async function createTeam() {
    if (!newTeamName || !newTeamSlug) return setMsg("Name and slug required");
    const res = await fetch("/api/admin/ops/queue/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName, slug: newTeamSlug, role: newTeamRole }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Team "${data.team?.name}" created` : data?.error || "Create failed");
    setNewTeamName(""); setNewTeamSlug("");
    await load();
  }

  async function deleteTeam(id: string) {
    if (!confirm("Delete this team and all members?")) return;
    const res = await fetch(`/api/admin/ops/queue/teams/${id}`, { method: "DELETE" });
    const data = await res.json();
    setMsg(res.ok ? "Team deleted" : data?.error || "Delete failed");
    await load();
  }

  async function addMember(teamId: string) {
    const raw = (newMemberInputs[teamId] || "").trim();
    if (!raw) return setMsg("Enter an email or @domain");
    const isDomain = raw.startsWith("@");
    const payload = isDomain ? { domain: raw.slice(1) } : { email: raw };
    const res = await fetch(`/api/admin/ops/queue/teams/${teamId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMsg(res.ok ? `Member added` : data?.error || "Add failed");
    setNewMemberInputs((prev) => ({ ...prev, [teamId]: "" }));
    await load();
  }

  async function removeMember(teamId: string, memberId: string) {
    const res = await fetch(`/api/admin/ops/queue/teams/${teamId}/members/${memberId}`, { method: "DELETE" });
    const data = await res.json();
    setMsg(res.ok ? "Member removed" : data?.error || "Remove failed");
    await load();
  }

  // ── Webhook key actions ────────────────────────────────────────────────

  async function rotateWebhookKey() {
    if (!confirm("Generate a new signing key and activate it? The current active key will be deactivated.")) return;
    const res = await fetch("/api/admin/ops/queue/webhook-keys", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setNewKeyKid(data.kid);
      setNewKeySecret(data.secret);
      setMsg("New key generated — copy the secret below NOW, it won't be shown again.");
    } else {
      setMsg(data?.error || "Key generation failed");
    }
    await load();
  }

  async function activateKey(kid: string) {
    const res = await fetch(`/api/admin/ops/queue/webhook-keys/${encodeURIComponent(kid)}/activate`, { method: "POST" });
    const data = await res.json();
    setMsg(res.ok ? `Key "${kid}" activated` : data?.error || "Activate failed");
    await load();
  }

  async function revokeKey(kid: string) {
    if (!confirm(`Revoke key "${kid}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/ops/queue/webhook-keys/${encodeURIComponent(kid)}`, { method: "DELETE" });
    const data = await res.json();
    setMsg(res.ok ? `Key "${kid}" revoked` : data?.error || "Revoke failed");
    await load();
  }

  async function checkWebhookHealth() {
    setWebhookHealth(null);
    const url = metrics?.policy?.alertWebhook || process.env.NEXT_PUBLIC_ALERT_WEBHOOK_URL || "";
    const qs = url ? `?url=${encodeURIComponent(url)}` : "";
    const res = await fetch(`/api/admin/ops/queue/webhook-health${qs}`);
    const data = await res.json();
    setWebhookHealth(data);
    setMsg(data.ok ? `Webhook healthy — ${data.latencyMs}ms` : `Webhook unhealthy: ${data.reason || "no response"}`);
  }

  return (
    <section className="grid" style={{ gap: "1rem" }}>

      {/* ── Status bar ── */}
      {msg && (
        <div className="card" style={{ background: "var(--surface-raised, #f9fafb)", padding: ".75rem 1rem" }}>
          <p style={{ margin: 0 }}>{msg}</p>
        </div>
      )}

      {/* ── Queue controls ── */}
      <div className="card">
        <h2>Upload Queue (Dead-letter + Replay)</h2>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          <button onClick={processNow}>Process Queue Now</button>
          <button className="ghost" onClick={replayAllFailed}>Replay All Failed</button>
        </div>
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

      {/* ── Webhook Key Rotation ── */}
      <div className="card">
        <h3>Webhook Signing Keys</h3>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <button onClick={rotateWebhookKey}>Rotate Key (Generate New)</button>
          <button className="ghost" onClick={checkWebhookHealth}>
            Check Webhook Health
            {webhookHealth && (webhookHealth.ok ? " ✅" : " ❌")}
          </button>
        </div>
        {newKeySecret && (
          <div style={{ background: "#fefce8", border: "1px solid #fbbf24", borderRadius: 6, padding: "1rem", marginBottom: "1rem" }}>
            <strong>⚠️ New Key Created — copy this secret now, it will not be shown again!</strong>
            <br />
            <code>kid: {newKeyKid}</code>
            <br />
            <code style={{ wordBreak: "break-all" }}>secret: {newKeySecret}</code>
            <br />
            <button className="ghost" style={{ marginTop: ".5rem", width: "auto" }} onClick={() => { setNewKeySecret(null); setNewKeyKid(null); }}>
              Dismiss
            </button>
          </div>
        )}
        {webhookKeys.length === 0 ? <p>No signing keys configured. Generate one or set env vars.</p> : (
          <table style={{ width: "100%", fontSize: ".875rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: ".5rem" }}>KID</th>
                <th style={{ padding: ".5rem" }}>Source</th>
                <th style={{ padding: ".5rem" }}>Status</th>
                <th style={{ padding: ".5rem" }}>Created</th>
                <th style={{ padding: ".5rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhookKeys.map((k) => (
                <tr key={k.kid} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: ".5rem", fontFamily: "monospace" }}>{k.kid}</td>
                  <td style={{ padding: ".5rem" }}>{k.source}</td>
                  <td style={{ padding: ".5rem" }}>
                    {k.revokedAt ? "revoked" : k.isActive ? "✅ active" : "inactive"}
                  </td>
                  <td style={{ padding: ".5rem" }}>{k.createdAt ? new Date(k.createdAt).toLocaleString() : "—"}</td>
                  <td style={{ padding: ".5rem", display: "flex", gap: ".5rem" }}>
                    {k.source === "db" && !k.revokedAt && !k.isActive && (
                      <button className="ghost" style={{ width: "auto" }} onClick={() => activateKey(k.kid)}>Activate</button>
                    )}
                    {k.source === "db" && !k.revokedAt && (
                      <button className="ghost" style={{ width: "auto", color: "#dc2626" }} onClick={() => revokeKey(k.kid)}>Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Policy Teams ── */}
      <div className="card">
        <h3>Policy Teams (Requesters / Approvers)</h3>
        <p style={{ fontSize: ".875rem", color: "#6b7280" }}>
          DB teams override env-based allowlists. Add a team to activate DB-backed role control.
        </p>

        {/* Create team */}
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <input placeholder="Team name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
          <input
            placeholder="slug (a-z0-9-)"
            value={newTeamSlug}
            onChange={(e) => setNewTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            style={{ flex: 1, minWidth: 120 }}
          />
          <select value={newTeamRole} onChange={(e) => setNewTeamRole(e.target.value as any)} style={{ width: "auto" }}>
            <option value="APPROVER">Approver</option>
            <option value="REQUESTER">Requester</option>
          </select>
          <button onClick={createTeam} style={{ width: "auto" }}>Create Team</button>
        </div>

        {teams.length === 0 ? <p>No teams yet. Teams override env-based allowlists when created.</p> : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {teams.map((team) => (
              <div key={team.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".5rem" }}>
                  <strong>{team.name}</strong>
                  <code style={{ fontSize: ".75rem", background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{team.slug}</code>
                  <span style={{
                    fontSize: ".75rem", padding: "2px 8px", borderRadius: 999,
                    background: team.role === "APPROVER" ? "#dbeafe" : "#dcfce7",
                    color: team.role === "APPROVER" ? "#1d4ed8" : "#166534",
                  }}>
                    {team.role}
                  </span>
                  <button className="ghost" style={{ width: "auto", marginLeft: "auto", color: "#dc2626", fontSize: ".75rem" }} onClick={() => deleteTeam(team.id)}>
                    Delete Team
                  </button>
                </div>

                <ul style={{ margin: "0 0 .5rem", padding: "0 0 0 1.25rem", fontSize: ".875rem" }}>
                  {team.members.length === 0 && <li style={{ color: "#9ca3af" }}>No members yet.</li>}
                  {team.members.map((m) => (
                    <li key={m.id} style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                      <span>{m.email ?? `@${m.domain}`}</span>
                      <button className="ghost" style={{ width: "auto", fontSize: ".75rem", color: "#dc2626" }} onClick={() => removeMember(team.id, m.id)}>×</button>
                    </li>
                  ))}
                </ul>

                <div style={{ display: "flex", gap: ".5rem" }}>
                  <input
                    placeholder="email or @domain"
                    value={newMemberInputs[team.id] || ""}
                    onChange={(e) => setNewMemberInputs((prev) => ({ ...prev, [team.id]: e.target.value }))}
                    style={{ flex: 1 }}
                    onKeyDown={(e) => e.key === "Enter" && addMember(team.id)}
                  />
                  <button style={{ width: "auto" }} onClick={() => addMember(team.id)}>Add</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pending approvals ── */}
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
