import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { verifyInviteSignature } from "@/lib/security/signed-invite";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(8),
  name: z.string().optional(),
  ts: z.coerce.number().optional(),
  sig: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await checkRateLimit({ scope: "invite:consume:ip", key: ip, limit: 30, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) return NextResponse.json({ error: "Too many invite attempts from this IP" }, { status: 429 });

    const invite = await db.inviteToken.findUnique({ where: { token: input.token } });

    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.revokedAt) return NextResponse.json({ error: "Invite revoked" }, { status: 400 });
    if (!input.ts || !input.sig) {
      return NextResponse.json({ error: "Signed invite parameters required" }, { status: 400 });
    }
    if (!verifyInviteSignature(invite.token, input.ts, input.sig)) {
      return NextResponse.json({ error: "Invalid invite signature" }, { status: 400 });
    }

    const nonceKey = `${invite.token}:${input.ts}:${input.sig}`;
    try {
      await db.inviteNonceUse.create({ data: { nonceKey } });
    } catch {
      return NextResponse.json({ error: "Invite link already used (replay blocked)" }, { status: 409 });
    }

    if (invite.consumedAt) return NextResponse.json({ error: "Invite already used" }, { status: 400 });
    if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Invite expired" }, { status: 400 });

    const user = await db.user.upsert({
      where: { email: invite.email },
      update: { role: invite.role, name: input.name ?? undefined },
      create: { email: invite.email, name: input.name, role: invite.role, isVerified: invite.role !== "ADMIN" },
    });

    await db.inviteToken.update({ where: { id: invite.id }, data: { consumedAt: new Date(), consumedById: user.id } });

    await logAudit({
      actorId: user.id,
      action: "INVITE_CONSUMED",
      targetType: "InviteToken",
      targetId: invite.id,
      metadata: { before: { consumedAt: invite.consumedAt }, after: { consumedById: user.id } },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Invalid invite payload", details: String(error) }, { status: 400 });
  }
}
