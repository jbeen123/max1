import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(40).regex(/^[a-z0-9-]+$/),
  role: z.enum(["REQUESTER", "APPROVER"]),
});

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const teams = await db.policyTeam.findMany({
    include: { members: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ teams });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = createSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const existing = await db.policyTeam.findUnique({ where: { slug: body.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const team = await db.policyTeam.create({ data: body.data, include: { members: true } });
  return NextResponse.json({ team }, { status: 201 });
}
