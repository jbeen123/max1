import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { markAsRead } from "@/lib/notifications";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["BUYER","SELLER","ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await markAsRead(id, auth.user.id);
  return NextResponse.json({ ok: true });
}
