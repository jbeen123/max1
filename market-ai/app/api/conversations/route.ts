import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getOrCreateConversation, getUserConversations } from "@/lib/messaging";

const createSchema = z.object({
  participantId: z.string().min(1),
  propertyId: z.string().optional(),
});

export async function GET() {
  const auth = await requireRole(["BUYER","SELLER","ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await getUserConversations(auth.user.id);
  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  const auth = await requireRole(["BUYER","SELLER","ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = createSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  if (body.data.participantId === auth.user.id) {
    return NextResponse.json({ error: "Cannot create conversation with yourself" }, { status: 400 });
  }

  const conversation = await getOrCreateConversation(
    [auth.user.id, body.data.participantId],
    body.data.propertyId,
  );

  return NextResponse.json({ conversation }, { status: 201 });
}
