import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { pruneRateLimitEvents } from "@/lib/ops/maintenance";

export async function POST() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const prune = await pruneRateLimitEvents(72);

  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), tasks: { pruneRateLimitEvents: prune } });
}
