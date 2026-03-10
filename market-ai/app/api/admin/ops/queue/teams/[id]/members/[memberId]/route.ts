import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id, memberId } = await params;
  const member = await db.policyTeamMember.findFirst({
    where: { id: memberId, teamId: id },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.policyTeamMember.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}
