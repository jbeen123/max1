import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  role: z.enum(["BUYER", "SELLER", "ADMIN"]),
  state: z.string().min(2).max(2).optional(),
});

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());
    const user = await db.user.upsert({
      where: { email: input.email.toLowerCase() },
      update: {
        name: input.name,
        role: input.role,
        state: input.state?.toUpperCase(),
      },
      create: {
        email: input.email.toLowerCase(),
        name: input.name,
        role: input.role,
        state: input.state?.toUpperCase(),
        isVerified: input.role === "BUYER" || input.role === "SELLER",
      },
    });

    const res = NextResponse.json({ user });
    res.cookies.set(AUTH_COOKIE, user.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Invalid login payload", details: String(error) }, { status: 400 });
  }
}
