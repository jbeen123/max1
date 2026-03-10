import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/notifications";

export async function GET(req: Request) {
  const auth = await requireRole(["BUYER","SELLER","ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const [items, unreadCount] = await Promise.all([
    getUserNotifications(auth.user.id, { unreadOnly }),
    getUnreadCount(auth.user.id),
  ]);

  return NextResponse.json({ items, unreadCount });
}

export async function PATCH(req: Request) {
  const auth = await requireRole(["BUYER","SELLER","ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.markAllRead) {
    const result = await markAllAsRead(auth.user.id);
    return NextResponse.json({ ok: true, updated: result.count });
  }

  if (body.notificationId) {
    const result = await markAsRead(body.notificationId, auth.user.id);
    return NextResponse.json({ ok: true, updated: result.count });
  }

  return NextResponse.json({ error: "Provide notificationId or markAllRead" }, { status: 400 });
}
