import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { sendMessage, getConversationMessages } from "@/lib/messaging";
import { createNotification } from "@/lib/notifications";
import { db } from "@/lib/db";

const sendSchema = z.object({
  body: z.string().min(1).max(5000),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["BUYER","SELLER","ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const before = searchParams.get("before") || undefined;

  try {
    const messages = await getConversationMessages(id, auth.user.id, { before });
    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["BUYER","SELLER","ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = sendSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  try {
    const message = await sendMessage(id, auth.user.id, body.data.body);

    // Notify other participants
    const participants = await db.conversationParticipant.findMany({
      where: { conversationId: id, userId: { not: auth.user.id } },
    });
    const senderName = auth.user.name || auth.user.email;

    await Promise.all(
      participants.map((p) =>
        createNotification({
          userId: p.userId,
          type: "SYSTEM",
          title: `Message from ${senderName}`,
          body: body.data.body.length > 100 ? body.data.body.slice(0, 100) + "…" : body.data.body,
          link: `/messages?c=${id}`,
        }),
      ),
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 });
  }
}
