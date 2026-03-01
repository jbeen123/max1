import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  token: z.string().min(8),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());
    const invite = await db.inviteToken.findUnique({ where: { token: input.token } });

    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.consumedAt) return NextResponse.json({ error: "Invite already used" }, { status: 400 });
    if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Invite expired" }, { status: 400 });

    const user = await db.user.upsert({
      where: { email: invite.email },
      update: { role: invite.role, name: input.name ?? undefined },
      create: {
        email: invite.email,
        name: input.name,
        role: invite.role,
        isVerified: invite.role !== "ADMIN",
      },
    });

    await db.inviteToken.update({
      where: { id: invite.id },
      data: { consumedAt: new Date(), consumedById: user.id },
    });

    await logAudit({
      actorId: user.id,
      action: "INVITE_CONSUMED",
      targetType: "InviteToken",
      targetId: invite.id,
      metadata: { email: invite.email, role: invite.role },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Invalid invite payload", details: String(error) }, { status: 400 });
  }
}
