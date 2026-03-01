import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  email: z.string().email(),
  role: z.enum(["BUYER", "SELLER", "ADMIN"]),
  expiresInHours: z.coerce.number().int().min(1).max(24 * 30).default(72),
});

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const invites = await db.inviteToken.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(invites);
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

    await logAudit({
      actorId: auth.user.id,
      action: "INVITE_CREATED",
      targetType: "InviteToken",
      targetId: invite.id,
      metadata: { email: invite.email, role: invite.role, expiresAt: invite.expiresAt.toISOString() },
    });

    const inviteUrl = `/login?invite=${invite.token}&email=${encodeURIComponent(invite.email)}`;

    return NextResponse.json({ ...invite, inviteUrl });
  } catch (error) {
    return NextResponse.json({ error: "Invalid invite payload", details: String(error) }, { status: 400 });
  }
}
