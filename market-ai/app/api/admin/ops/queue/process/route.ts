import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { isEdgeTrusted } from "@/lib/auth-edge";
import { processUploadQueue } from "@/lib/queue/upload-queue";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  const trusted = isEdgeTrusted(req);
  if ((!auth.ok || !auth.user) && !trusted) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || "20")));
  const results = await processUploadQueue(limit);

  await logAudit({
    actorId: auth.user?.id ?? null,
    action: "UPLOAD_QUEUE_PROCESSED",
    targetType: "UploadJob",
    targetId: "batch",
    metadata: { limit, processed: results.length },
  });

  return NextResponse.json({ ok: true, results });
}
