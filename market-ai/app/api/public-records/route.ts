import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { PublicRecordSearchFilters } from "@/lib/public-records/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const filters: PublicRecordSearchFilters = {
    state: searchParams.get("state") ?? undefined,
    county: searchParams.get("county") ?? undefined,
    minMarketValue: searchParams.get("minValue") ? Number(searchParams.get("minValue")) : undefined,
    maxMarketValue: searchParams.get("maxValue") ? Number(searchParams.get("maxValue")) : undefined,
    minLotAcres: searchParams.get("minAcres") ? Number(searchParams.get("minAcres")) : undefined,
    maxLotAcres: searchParams.get("maxAcres") ? Number(searchParams.get("maxAcres")) : undefined,
    taxStatus: (searchParams.get("taxStatus") as any) ?? undefined,
    isOutOfState: searchParams.get("outOfState") === "true" ? true : searchParams.get("outOfState") === "false" ? false : undefined,
    zoning: searchParams.get("zoning") ?? undefined,
    query: searchParams.get("q") ?? undefined,
    skip: searchParams.get("skip") ? Number(searchParams.get("skip")) : 0,
    take: Math.min(50, searchParams.get("take") ? Number(searchParams.get("take")) : 20),
  };

  // Build Prisma where clause
  const where: any = {};
  if (filters.state) where.state = filters.state;
  if (filters.county) where.county = { contains: filters.county, mode: "insensitive" };
  if (filters.minMarketValue !== undefined || filters.maxMarketValue !== undefined) {
    where.marketValue = {};
    if (filters.minMarketValue !== undefined) where.marketValue.gte = filters.minMarketValue;
    if (filters.maxMarketValue !== undefined) where.marketValue.lte = filters.maxMarketValue;
  }
  if (filters.minLotAcres !== undefined || filters.maxLotAcres !== undefined) {
    where.lotSizeAcres = {};
    if (filters.minLotAcres !== undefined) where.lotSizeAcres.gte = filters.minLotAcres;
    if (filters.maxLotAcres !== undefined) where.lotSizeAcres.lte = filters.maxLotAcres;
  }
  if (filters.taxStatus) where.taxStatus = filters.taxStatus;
  if (filters.isOutOfState !== undefined) where.isOutOfState = filters.isOutOfState;
  if (filters.zoning) where.zoning = { contains: filters.zoning, mode: "insensitive" };
  if (filters.query) {
    where.OR = [
      { ownerName: { contains: filters.query, mode: "insensitive" } },
      { propertyAddress: { contains: filters.query, mode: "insensitive" } },
      { parcelId: { contains: filters.query, mode: "insensitive" } },
      { county: { contains: filters.query, mode: "insensitive" } },
    ];
  }

  const [records, total] = await Promise.all([
    db.publicRecord.findMany({
      where,
      skip: filters.skip,
      take: filters.take,
      orderBy: { createdAt: "desc" },
    }),
    db.publicRecord.count({ where }),
  ]);

  return NextResponse.json({ records, total, skip: filters.skip, take: filters.take });
}
