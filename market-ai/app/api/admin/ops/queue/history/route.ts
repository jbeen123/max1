import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const events = await db.queueCircuitEvent.findMany({
    where: { queueKey: "ATTESTATION_UPLOAD" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ items: events });
}
