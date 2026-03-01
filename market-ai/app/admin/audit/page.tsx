import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; targetType?: string }>;
}) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) {
    return <section className="card"><h2>Forbidden</h2><p>Admin access required.</p></section>;
  }

  const sp = await searchParams;
  const action = sp.action || "";
  const targetType = sp.targetType || "";

  const logs = await db.auditLog.findMany({
    where: {
      action: action ? { contains: action, mode: "insensitive" } : undefined,
      targetType: targetType ? { contains: targetType, mode: "insensitive" } : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const csvUrl = `/api/admin/audit?format=csv&action=${encodeURIComponent(action)}&targetType=${encodeURIComponent(targetType)}`;

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <div className="card">
        <h2>Audit Logs</h2>
        <form className="grid grid-3" method="GET">
          <input name="action" placeholder="Filter action" defaultValue={action} />
          <input name="targetType" placeholder="Filter target type" defaultValue={targetType} />
          <button type="submit">Apply Filters</button>
        </form>
        <p style={{ marginTop: ".75rem" }}><Link href={csvUrl}>Export CSV</Link></p>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Time</th>
              <th style={{ textAlign: "left" }}>Action</th>
              <th style={{ textAlign: "left" }}>Target</th>
              <th style={{ textAlign: "left" }}>Actor</th>
              <th style={{ textAlign: "left" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.createdAt.toISOString()}</td>
                <td>{log.action}</td>
                <td>{log.targetType}:{log.targetId}</td>
                <td>{log.actorId ?? "system"}</td>
                <td><Link href={`/admin/audit/${log.id}`}>open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p>No logs found.</p>}
      </div>
    </section>
  );
}
