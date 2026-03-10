import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  runMatchingEngine,
  type PropertyProfile,
  type BuyerProfile,
} from "@/lib/ai/matching";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const minScore = parseInt(searchParams.get("minScore") ?? "30", 10);
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10));
  const buyerIdFilter = searchParams.get("buyerId");
  const propertyIdFilter = searchParams.get("propertyId");

  // Fetch properties with lead scores
  const properties = await db.property.findMany({
    where: {
      status: "ACTIVE",
      ...(propertyIdFilter ? { id: propertyIdFilter } : {}),
    },
    include: {
      leadScore: true,
      seller: { select: { id: true, name: true, email: true } },
    },
    take: 100,
  });

  // Fetch verified buyers
  const buyers = await db.user.findMany({
    where: {
      role: "BUYER",
      isVerified: true,
      ...(buyerIdFilter ? { id: buyerIdFilter } : {}),
    },
    take: 100,
  });

  // Build profiles
  const propertyProfiles: PropertyProfile[] = properties.map((p) => ({
    id: p.id,
    state: p.state,
    county: p.county,
    zoning: p.zoning,
    lotSizeAcres: p.lotSizeAcres,
    askingPrice: p.askingPrice,
    assignmentAllowed: p.assignmentAllowed,
    status: p.status,
    leadScore: p.leadScore?.score ?? null,
  }));

  const buyerProfiles: BuyerProfile[] = buyers.map((b) => ({
    id: b.id,
    state: b.state,
    preferences: null, // extend with BuyerPreferences model later
  }));

  const results = runMatchingEngine(propertyProfiles, buyerProfiles, {
    minScore,
    limit,
  });

  // Persist top matches to DB (upsert)
  if (results.length > 0) {
    await Promise.allSettled(
      results.slice(0, 50).map((r) =>
        db.matchScore.upsert({
          where: { propertyId_buyerId: { propertyId: r.propertyId, buyerId: r.buyerId } },
          create: {
            propertyId: r.propertyId,
            buyerId: r.buyerId,
            score: r.score,
            factors: r.factors as any,
          },
          update: {
            score: r.score,
            factors: r.factors as any,
          },
        })
      )
    );
  }

  // Enrich results with property/buyer data for the response
  const propMap = Object.fromEntries(properties.map((p) => [p.id, p]));
  const buyerMap = Object.fromEntries(buyers.map((b) => [b.id, b]));

  const enriched = results.map((r) => ({
    ...r,
    property: propMap[r.propertyId]
      ? {
          id: propMap[r.propertyId].id,
          title: propMap[r.propertyId].title,
          state: propMap[r.propertyId].state,
          county: propMap[r.propertyId].county,
          askingPrice: propMap[r.propertyId].askingPrice,
          zoning: propMap[r.propertyId].zoning,
          lotSizeAcres: propMap[r.propertyId].lotSizeAcres,
        }
      : null,
    buyer: buyerMap[r.buyerId]
      ? {
          id: buyerMap[r.buyerId].id,
          name: buyerMap[r.buyerId].name,
          email: buyerMap[r.buyerId].email,
          state: buyerMap[r.buyerId].state,
        }
      : null,
  }));

  return NextResponse.json({
    count: enriched.length,
    matches: enriched,
  });
}
