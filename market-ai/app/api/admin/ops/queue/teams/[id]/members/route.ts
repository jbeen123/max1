import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const addSchema = z.object({
  email: z.string().email().optional(),
  domain: z.string().min(1).max(100).optional(),
}).refine((d) => d.email || d.domain, { message: "email or domain required" });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  const members = await db.policyTeamMember.findMany({
    where: { teamId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ members });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  const team = await db.policyTeam.findUnique({ where: { id } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const body = addSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const member = await db.policyTeamMember.create({
    data: {
      teamId: id,
      email: body.data.email?.toLowerCase(),
      domain: body.data.domain?.toLowerCase(),
    },
  });

  return NextResponse.json({ member }, { status: 201 });
}
