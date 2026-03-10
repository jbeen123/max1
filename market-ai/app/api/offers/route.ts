import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import {
  notifyOfferReceived,
  notifyOfferCountered,
  notifyOfferAccepted,
  notifyOfferRejected,
} from "@/lib/notifications";

const createSchema = z.object({
  propertyId: z.string().min(1),
  amount: z.coerce.number().int().positive(),
  message: z.string().optional(),
});

const counterSchema = z.object({
  offerId: z.string().min(1),
  counterAmount: z.coerce.number().int().positive(),
  counterMessage: z.string().optional(),
});

const statusSchema = z.object({
  offerId: z.string().min(1),
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export async function GET(req: Request) {
  const auth = await requireRole(["BUYER", "SELLER", "ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");

  const offers = await db.offer.findMany({
    where: propertyId ? { propertyId } : undefined,
    include: {
      buyer: { select: { id: true, email: true, name: true } },
      property: { select: { id: true, title: true, sellerId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const filtered = offers.filter(
    (o) => auth.user?.role === "ADMIN" || o.buyerId === auth.user?.id || o.property.sellerId === auth.user?.id,
  );
  return NextResponse.json(filtered);
}

export async function POST(req: Request) {
  const auth = await requireRole(["BUYER"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Only buyers can submit offers" }, { status: 403 });

  try {
    const input = createSchema.parse(await req.json());

    const property = await db.property.findUnique({ where: { id: input.propertyId } });
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    const offer = await db.offer.create({
      data: {
        propertyId: input.propertyId,
        buyerId: auth.user.id,
        amount: input.amount,
        message: input.message,
      },
    });

    // Notify seller
    notifyOfferReceived(property.sellerId, property.title, input.amount, offer.id).catch(() => {});

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid offer payload", details: String(error) }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireRole(["SELLER", "ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Only sellers/admin can counter" }, { status: 403 });

  try {
    const input = counterSchema.parse(await req.json());
    const existing = await db.offer.findUnique({
      where: { id: input.offerId },
      include: { property: true },
    });

    if (!existing) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    const isOwner = auth.user.role === "ADMIN" || existing.property.sellerId === auth.user.id;
    if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await db.offer.update({
      where: { id: input.offerId },
      data: {
        status: "COUNTERED",
        counterAmount: input.counterAmount,
        counterMessage: input.counterMessage,
      },
    });

    // Notify buyer
    notifyOfferCountered(existing.buyerId, existing.property.title, input.counterAmount).catch(() => {});

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Invalid counter payload", details: String(error) }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireRole(["SELLER", "ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Sellers/admin only" }, { status: 403 });

  try {
    const input = statusSchema.parse(await req.json());
    const existing = await db.offer.findUnique({
      where: { id: input.offerId },
      include: { property: true },
    });

    if (!existing) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    const isOwner = auth.user.role === "ADMIN" || existing.property.sellerId === auth.user.id;
    if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await db.offer.update({
      where: { id: input.offerId },
      data: { status: input.status },
    });

    if (input.status === "ACCEPTED") {
      notifyOfferAccepted(existing.buyerId, existing.property.title).catch(() => {});
    } else {
      notifyOfferRejected(existing.buyerId, existing.property.title).catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload", details: String(error) }, { status: 400 });
  }
}
