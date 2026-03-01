import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const keepHours = Math.max(1, Math.min(24 * 30, Number(searchParams.get("keepHours") || "72")));
  const cutoff = new Date(Date.now() - keepHours * 60 * 60 * 1000);

  const result = await db.rateLimitEvent.deleteMany({ where: { createdAt: { lt: cutoff } } });

  await logAudit({
    actorId: auth.user.id,
    action: "RATE_LIMIT_EVENTS_PRUNED",
    targetType: "RateLimitEvent",
    targetId: "bulk",
    metadata: { keepHours, deleted: result.count },
  });

  return NextResponse.json({ ok: true, deleted: result.count, keepHours });
}
