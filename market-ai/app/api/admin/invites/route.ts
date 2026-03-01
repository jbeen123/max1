import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendInviteEmail } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rate-limit";
import { signInviteToken } from "@/lib/security/signed-invite";

const createSchema = z.object({
  email: z.string().email(),
  role: z.enum(["BUYER", "SELLER", "ADMIN"]),
  expiresInHours: z.coerce.number().int().min(1).max(24 * 30).default(72),
});

const actionSchema = z.object({
  inviteId: z.string().min(1),
  action: z.enum(["revoke", "resend"]),
});

export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || "20")));
  const cursor = searchParams.get("cursor") || undefined;

  const invites = await db.inviteToken.findMany({
    orderBy: { createdAt: "desc" },
    take: pageSize + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = invites.length > pageSize;
  const sliced = hasMore ? invites.slice(0, pageSize) : invites;
  const nextCursor = hasMore ? sliced[sliced.length - 1]?.id : null;

  return NextResponse.json({ items: sliced, nextCursor });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const input = createSchema.parse(await req.json());

    const rl = await checkRateLimit({ scope: "invite:create", key: auth.user.id, limit: 20, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) return NextResponse.json({ error: "Rate limit reached for invite creation" }, { status: 429 });

    const token = crypto.randomUUID().replaceAll("-", "");
    const expiresAt = new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000);

    const invite = await db.inviteToken.create({
      data: {
        token,
        email: input.email.toLowerCase(),
        role: input.role,
        createdById: auth.user.id,
        expiresAt,
        lastSentAt: new Date(),
      },
    });

    const ts = Date.now();
    const sig = signInviteToken(invite.token, ts);
    const inviteUrl = `/login?invite=${invite.token}&email=${encodeURIComponent(invite.email)}&ts=${ts}&sig=${sig}`;
    const delivery = await sendInviteEmail({ to: invite.email, inviteUrl, role: invite.role });

    await logAudit({ actorId: auth.user.id, action: "INVITE_CREATED", targetType: "InviteToken", targetId: invite.id, metadata: { after: invite, delivery } });
    return NextResponse.json({ ...invite, inviteUrl, delivery });
  } catch (error) {
    return NextResponse.json({ error: "Invalid invite payload", details: String(error) }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const input = actionSchema.parse(await req.json());
    const invite = await db.inviteToken.findUnique({ where: { id: input.inviteId } });
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

    if (input.action === "revoke") {
      const updated = await db.inviteToken.update({ where: { id: invite.id }, data: { revokedAt: new Date(), revokedById: auth.user.id } });
      await logAudit({ actorId: auth.user.id, action: "INVITE_REVOKED", targetType: "InviteToken", targetId: invite.id, metadata: { before: invite, after: updated } });
      return NextResponse.json(updated);
    }

    if (invite.lastSentAt && Date.now() - new Date(invite.lastSentAt).getTime() < 60_000) {
      return NextResponse.json({ error: "Invite resend cooldown active (60s)" }, { status: 429 });
    }

    const rl = await checkRateLimit({ scope: "invite:resend", key: auth.user.id, limit: 30, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) return NextResponse.json({ error: "Rate limit reached for invite resends" }, { status: 429 });

    const ts = Date.now();
    const sig = signInviteToken(invite.token, ts);
    const inviteUrl = `/login?invite=${invite.token}&email=${encodeURIComponent(invite.email)}&ts=${ts}&sig=${sig}`;
    const delivery = await sendInviteEmail({ to: invite.email, inviteUrl, role: invite.role });

    const updated = await db.inviteToken.update({
      where: { id: invite.id },
      data: { lastSentAt: new Date(), resendCount: { increment: 1 } },
    });

    await logAudit({ actorId: auth.user.id, action: "INVITE_RESENT", targetType: "InviteToken", targetId: invite.id, metadata: { before: invite, after: updated, delivery, inviteUrl } });
    return NextResponse.json({ ok: true, delivery, inviteUrl });
  } catch (error) {
    return NextResponse.json({ error: "Invalid invite action payload", details: String(error) }, { status: 400 });
  }
}
