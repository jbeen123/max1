import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; targetType?: string; page?: string }>;
}) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) {
    return <section className="card"><h2>Forbidden</h2><p>Admin access required.</p></section>;
  }

  const sp = await searchParams;
  const action = sp.action || "";
  const targetType = sp.targetType || "";
  const page = Math.max(1, Number(sp.page || "1"));
  const pageSize = 30;
  const skip = (page - 1) * pageSize;

  const where = {
    action: action ? { contains: action, mode: "insensitive" as const } : undefined,
    targetType: targetType ? { contains: targetType, mode: "insensitive" as const } : undefined,
  };

  const [total, logs] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
  ]);

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
        <p style={{ marginTop: ".75rem" }}><Link href={csvUrl}>Export CSV</Link> · Total {total}</p>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th>Time</th><th>Action</th><th>Target</th><th>Actor</th><th>Details</th></tr></thead>
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
        <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem" }}>
          {page > 1 && <Link href={`/admin/audit?action=${encodeURIComponent(action)}&targetType=${encodeURIComponent(targetType)}&page=${page - 1}`}>Prev</Link>}
          {page * pageSize < total && <Link href={`/admin/audit?action=${encodeURIComponent(action)}&targetType=${encodeURIComponent(targetType)}&page=${page + 1}`}>Next</Link>}
        </div>
        {logs.length === 0 && <p>No logs found.</p>}
      </div>
    </section>
  );
}
