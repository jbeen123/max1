import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { pruneRateLimitEvents } from "@/lib/ops/maintenance";
import { isEdgeTrusted } from "@/lib/auth-edge";
import { acquireOpsLock, releaseOpsLock } from "@/lib/ops/lock";
import { processUploadQueue } from "@/lib/queue/upload-queue";

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok && !isEdgeTrusted(req)) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const owner = auth.user?.id ?? "edge";
  const locked = await acquireOpsLock("maintenance", owner, 60_000);
  if (!locked) return NextResponse.json({ error: "Maintenance already running" }, { status: 409 });

  try {
    const prune = await pruneRateLimitEvents(72);
    const uploads = await processUploadQueue(10);
    return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), tasks: { pruneRateLimitEvents: prune, processUploadQueue: uploads } });
  } finally {
    await releaseOpsLock("maintenance", owner);
  }
}
