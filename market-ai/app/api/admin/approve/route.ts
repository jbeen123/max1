import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// POST /api/admin/approve?id=PROPERTY_ID
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("id");

  if (!propertyId) {
    return NextResponse.json({ error: "Property ID required" }, { status: 400 });
  }

  try {
    const property = await db.property.update({
      where: { id: propertyId },
      data: { status: "ACTIVE" },
      include: { seller: true },
    });

    // Notify the seller
    await db.notification.create({
      data: {
        userId: property.sellerId,
        type: "LISTING_APPROVED",
        title: "Your listing was approved",
        body: `"${property.title}" is now live and visible to buyers.`,
        link: `/property/${property.id}`,
      },
    });

    return NextResponse.json({ success: true, property });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to approve listing", details: String(error) },
      { status: 500 }
    );
  }
}
