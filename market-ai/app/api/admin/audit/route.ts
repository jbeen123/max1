import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || undefined;
  const targetType = searchParams.get("targetType") || undefined;
  const format = searchParams.get("format") || "json";

  const logs = await db.auditLog.findMany({
    where: {
      action: action ? { contains: action, mode: "insensitive" } : undefined,
      targetType: targetType ? { contains: targetType, mode: "insensitive" } : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  if (format === "csv") {
    const header = "createdAt,actorId,action,targetType,targetId\n";
    const rows = logs
      .map((l) => [l.createdAt.toISOString(), l.actorId ?? "", l.action, l.targetType, l.targetId].map((v) => `\"${String(v).replaceAll('"', '""')}\"`).join(","))
      .join("\n");

    return new NextResponse(`${header}${rows}\n`, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=audit_logs.csv",
      },
    });
  }

  return NextResponse.json(logs);
}
