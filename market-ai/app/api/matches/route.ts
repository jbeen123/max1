import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [properties, buyers] = await Promise.all([
    db.property.findMany({ where: { status: "ACTIVE" }, take: 20 }),
    db.user.findMany({ where: { role: "BUYER", isVerified: true }, take: 20 }),
  ]);

  const matches = properties.flatMap((p) =>
    buyers
      .filter((b) => !b.state || b.state === p.state)
      .map((b) => ({ propertyId: p.id, buyerId: b.id, state: p.state }))
  );

  return NextResponse.json({ count: matches.length, matches });
}
