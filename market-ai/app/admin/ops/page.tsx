import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminOpsPage() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return <section className="card"><h2>Forbidden</h2><p>Admin only.</p></section>;

  const [attestations, latestPrune] = await Promise.all([
    db.auditAttestation.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.auditLog.findFirst({ where: { action: "RATE_LIMIT_EVENTS_PRUNED" }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <div className="card">
        <h2>Admin Ops Dashboard</h2>
        <p>Use API endpoints to run maintenance/attestation jobs:</p>
        <ul>
          <li>POST /api/admin/ops/run-maintenance</li>
          <li>POST /api/admin/ops/attest-audit</li>
          <li>POST /api/admin/ops/attest-audit/upload</li>
        </ul>
        <p>Last prune: {latestPrune ? latestPrune.createdAt.toISOString() : "never"}</p>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <h3>Recent Audit Attestations</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><th>Time</th><th>Log Count</th><th>Tip Hash</th><th>Storage Path</th></tr>
          </thead>
          <tbody>
            {attestations.map((a) => (
              <tr key={a.id}>
                <td>{a.createdAt.toISOString()}</td>
                <td>{a.logCount}</td>
                <td>{a.tipHash.slice(0, 18)}...</td>
                <td>{a.storagePath ?? "n/a"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
