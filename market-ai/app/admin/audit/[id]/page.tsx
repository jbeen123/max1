import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) {
    return <section className="card"><h2>Forbidden</h2><p>Admin access required.</p></section>;
  }

  const { id } = await params;
  const log = await db.auditLog.findUnique({ where: { id } });

  if (!log) {
    return <section className="card"><h2>Not found</h2><p>Audit log does not exist.</p></section>;
  }

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <div className="card">
        <p><Link href="/admin/audit">← Back to audit logs</Link></p>
        <h2>{log.action}</h2>
        <p>Target: {log.targetType}:{log.targetId}</p>
        <p>Actor: {log.actorId ?? "system"}</p>
        <p>Time: {log.createdAt.toISOString()}</p>
      </div>
      <div className="card">
        <h3>Metadata</h3>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {JSON.stringify(log.metadata ?? {}, null, 2)}
        </pre>
      </div>
    </section>
  );
}
