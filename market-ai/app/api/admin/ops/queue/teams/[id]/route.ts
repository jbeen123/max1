import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  role: z.enum(["REQUESTER", "APPROVER"]).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  const team = await db.policyTeam.findUnique({
    where: { id },
    include: { members: true },
  });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ team });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  const body = patchSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const team = await db.policyTeam.update({
    where: { id },
    data: body.data,
    include: { members: true },
  });

  return NextResponse.json({ team });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  await db.policyTeam.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
