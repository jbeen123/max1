import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { markAllAsRead } from "@/lib/notifications";

export async function POST() {
  const auth = await requireRole(["BUYER","SELLER","ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await markAllAsRead(auth.user.id);
  return NextResponse.json({ ok: true, count: result.count });
}
