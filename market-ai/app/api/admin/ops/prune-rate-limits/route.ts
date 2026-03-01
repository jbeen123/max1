import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { pruneRateLimitEvents } from "@/lib/ops/maintenance";
import { isEdgeTrusted } from "@/lib/auth-edge";

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  const trusted = isEdgeTrusted(req);
  if ((!auth.ok || !auth.user) && !trusted) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const keepHours = Math.max(1, Math.min(24 * 30, Number(searchParams.get("keepHours") || "72")));

  const result = await pruneRateLimitEvents(keepHours);

  await logAudit({
    actorId: auth.user?.id ?? null,
    action: "RATE_LIMIT_EVENTS_PRUNED",
    targetType: "RateLimitEvent",
    targetId: "bulk",
    metadata: result,
  });

  return NextResponse.json({ ok: true, ...result });
}
