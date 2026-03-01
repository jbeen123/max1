import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendInviteEmail } from "@/lib/notify";

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
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;

  const [total, invites] = await Promise.all([
    db.inviteToken.count(),
    db.inviteToken.findMany({ orderBy: { createdAt: "desc" }, skip, take: pageSize }),
  ]);

  return NextResponse.json({ total, page, pageSize, invites });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const input = createSchema.parse(await req.json());
    const token = crypto.randomUUID().replaceAll("-", "");
    const expiresAt = new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000);

    const invite = await db.inviteToken.create({
      data: {
        token,
        email: input.email.toLowerCase(),
        role: input.role,
        createdById: auth.user.id,
        expiresAt,
      },
    });

    const inviteUrl = `/login?invite=${invite.token}&email=${encodeURIComponent(invite.email)}`;
    const delivery = await sendInviteEmail({ to: invite.email, inviteUrl, role: invite.role });

    await logAudit({
      actorId: auth.user.id,
      action: "INVITE_CREATED",
      targetType: "InviteToken",
      targetId: invite.id,
      metadata: { after: invite, delivery },
    });

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
      const updated = await db.inviteToken.update({
        where: { id: invite.id },
        data: { revokedAt: new Date(), revokedById: auth.user.id },
      });
      await logAudit({
        actorId: auth.user.id,
        action: "INVITE_REVOKED",
        targetType: "InviteToken",
        targetId: invite.id,
        metadata: { before: invite, after: updated },
      });
      return NextResponse.json(updated);
    }

    const inviteUrl = `/login?invite=${invite.token}&email=${encodeURIComponent(invite.email)}`;
    const delivery = await sendInviteEmail({ to: invite.email, inviteUrl, role: invite.role });
    await logAudit({
      actorId: auth.user.id,
      action: "INVITE_RESENT",
      targetType: "InviteToken",
      targetId: invite.id,
      metadata: { delivery, inviteUrl },
    });
    return NextResponse.json({ ok: true, delivery, inviteUrl });
  } catch (error) {
    return NextResponse.json({ error: "Invalid invite action payload", details: String(error) }, { status: 400 });
  }
}
