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
  const pageSize = Math.min(500, Math.max(1, Number(searchParams.get("pageSize") || (format === "csv" ? "500" : "30"))));
  const cursor = searchParams.get("cursor") || undefined;

  const where = {
    action: action ? { contains: action, mode: "insensitive" as const } : undefined,
    targetType: targetType ? { contains: targetType, mode: "insensitive" as const } : undefined,
  };

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: pageSize + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = logs.length > pageSize;
  const sliced = hasMore ? logs.slice(0, pageSize) : logs;
  const nextCursor = hasMore ? sliced[sliced.length - 1]?.id : null;

  if (format === "csv") {
    const header = "createdAt,actorId,action,targetType,targetId,prevHash,hash,metadata\n";
    const rows = sliced
      .map((l) => [l.createdAt.toISOString(), l.actorId ?? "", l.action, l.targetType, l.targetId, l.prevHash ?? "", l.hash ?? "", JSON.stringify(l.metadata ?? {})].map((v) => `\"${String(v).replaceAll('"', '""')}\"`).join(","))
      .join("\n");

    return new NextResponse(`${header}${rows}\n`, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=audit_logs.csv",
      },
    });
  }

  return NextResponse.json({ items: sliced, nextCursor });
}
