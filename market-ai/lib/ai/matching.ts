/**
 * AI Matching Engine - Core matching algorithm
 * Scores and ranks property/buyer pairs using multiple signals.
 */

export interface PropertyProfile {
  id: string;
  state: string;
  county: string;
  zoning?: string | null;
  lotSizeAcres?: number | null;
  askingPrice: number;
  assignmentAllowed: boolean;
  status: string;
  leadScore?: number | null;
}

export interface BuyerProfile {
  id: string;
  state?: string | null;
  preferences?: BuyerPreferences | null;
}

export interface BuyerPreferences {
  states?: string[];
  maxPrice?: number;
  minPrice?: number;
  zoningTypes?: string[];
  minLotAcres?: number;
  maxLotAcres?: number;
  wantsAssignment?: boolean;
  investmentTypes?: string[]; // e.g. "land", "commercial", "residential"
}

export interface MatchFactor {
  name: string;
  score: number;   // 0–1
  weight: number;  // relative weight
  reason: string;
}

export interface MatchResult {
  propertyId: string;
  buyerId: string;
  score: number;         // 0–100 final
  factors: MatchFactor[];
  tier: "A" | "B" | "C" | "D";
}

/**
 * Score a single property-buyer pair.
 * Returns a score 0–100 and the breakdown of factors.
 */
export function scoreMatch(
  property: PropertyProfile,
  buyer: BuyerProfile
): MatchResult {
  const prefs: BuyerPreferences = buyer.preferences ?? {};
  const factors: MatchFactor[] = [];

  // ── 1. Location match (25%) ─────────────────────────────────────────────
  let locationScore = 0;
  if (!prefs.states || prefs.states.length === 0) {
    locationScore = 0.5; // no preference = neutral
  } else if (prefs.states.includes(property.state)) {
    locationScore = 1.0;
  } else {
    locationScore = 0.0;
  }
  // Bonus if buyer's home state matches
  if (buyer.state && buyer.state === property.state) {
    locationScore = Math.min(1.0, locationScore + 0.2);
  }
  factors.push({
    name: "location",
    score: locationScore,
    weight: 0.25,
    reason: locationScore >= 0.8
      ? `Property in ${property.state} matches buyer's target markets`
      : locationScore >= 0.4
      ? "Buyer has no state preference – weak signal"
      : `Property state ${property.state} not in buyer's target list`,
  });

  // ── 2. Price range overlap (30%) ────────────────────────────────────────
  let priceScore = 0;
  const price = property.askingPrice;
  if (prefs.maxPrice === undefined && prefs.minPrice === undefined) {
    priceScore = 0.5;
  } else {
    const min = prefs.minPrice ?? 0;
    const max = prefs.maxPrice ?? Infinity;
    if (price >= min && price <= max) {
      // Sweet spot: center of range scores highest
      if (max !== Infinity) {
        const mid = (min + max) / 2;
        const halfRange = (max - min) / 2;
        const dist = Math.abs(price - mid);
        priceScore = halfRange > 0 ? 1 - dist / halfRange * 0.3 : 1.0;
      } else {
        priceScore = 0.85;
      }
    } else if (price < min) {
      priceScore = 0.2; // under min is still ok-ish (good deal)
    } else {
      // Over budget – scale down quickly
      const overage = (price - max) / max;
      priceScore = Math.max(0, 0.4 - overage * 2);
    }
  }
  factors.push({
    name: "price_fit",
    score: priceScore,
    weight: 0.30,
    reason: priceScore >= 0.8
      ? `Asking $${price.toLocaleString()} fits buyer's budget`
      : priceScore >= 0.4
      ? "Price is near buyer's range"
      : `Asking $${price.toLocaleString()} is outside buyer's target range`,
  });

  // ── 3. Property type / zoning match (20%) ───────────────────────────────
  let zoningScore = 0;
  if (!prefs.zoningTypes || prefs.zoningTypes.length === 0) {
    zoningScore = 0.5;
  } else if (property.zoning) {
    const z = property.zoning.toLowerCase();
    const match = prefs.zoningTypes.some((t) => z.includes(t.toLowerCase()));
    zoningScore = match ? 1.0 : 0.1;
  } else {
    zoningScore = 0.3; // unknown zoning = uncertain
  }
  factors.push({
    name: "zoning_match",
    score: zoningScore,
    weight: 0.20,
    reason: zoningScore >= 0.8
      ? `Zoning "${property.zoning}" matches buyer's preferences`
      : zoningScore >= 0.4
      ? "Zoning unknown or buyer has no preference"
      : `Zoning "${property.zoning}" doesn't match buyer's criteria`,
  });

  // ── 4. Lot size match (10%) ──────────────────────────────────────────────
  let lotScore = 0.5;
  if (property.lotSizeAcres !== undefined && property.lotSizeAcres !== null) {
    const acres = property.lotSizeAcres;
    if (prefs.minLotAcres !== undefined && acres < prefs.minLotAcres) {
      lotScore = 0.1;
    } else if (prefs.maxLotAcres !== undefined && acres > prefs.maxLotAcres) {
      lotScore = 0.3;
    } else if (prefs.minLotAcres !== undefined || prefs.maxLotAcres !== undefined) {
      lotScore = 1.0;
    }
  }
  factors.push({
    name: "lot_size",
    score: lotScore,
    weight: 0.10,
    reason: lotScore >= 0.8
      ? `Lot size ${property.lotSizeAcres} ac fits buyer's requirements`
      : "Lot size within tolerance or no preference set",
  });

  // ── 5. Seller motivation / lead score bonus (10%) ───────────────────────
  const motivationScore = property.leadScore != null
    ? Math.min(1.0, property.leadScore / 100)
    : 0.4;
  factors.push({
    name: "seller_motivation",
    score: motivationScore,
    weight: 0.10,
    reason: motivationScore >= 0.7
      ? "High seller motivation signals detected"
      : motivationScore >= 0.4
      ? "Moderate motivation signals"
      : "Low motivation or no data",
  });

  // ── 6. Assignment clause bonus (5%) ─────────────────────────────────────
  let assignScore = 0.5;
  if (prefs.wantsAssignment === true) {
    assignScore = property.assignmentAllowed ? 1.0 : 0.0;
  } else if (prefs.wantsAssignment === false) {
    assignScore = property.assignmentAllowed ? 0.5 : 1.0;
  }
  factors.push({
    name: "assignment_fit",
    score: assignScore,
    weight: 0.05,
    reason: property.assignmentAllowed
      ? "Assignment clause available"
      : "No assignment clause",
  });

  // ── Final weighted score ─────────────────────────────────────────────────
  const raw = factors.reduce(
    (acc, f) => acc + f.score * f.weight,
    0
  );
  const totalWeight = factors.reduce((acc, f) => acc + f.weight, 0);
  const normalized = (raw / totalWeight) * 100;
  const score = Math.round(Math.min(100, Math.max(0, normalized)));

  const tier: MatchResult["tier"] =
    score >= 75 ? "A" : score >= 55 ? "B" : score >= 35 ? "C" : "D";

  return { propertyId: property.id, buyerId: buyer.id, score, factors, tier };
}

/**
 * Score all buyer-property combinations and return top matches.
 */
export function runMatchingEngine(
  properties: PropertyProfile[],
  buyers: BuyerProfile[],
  opts: { minScore?: number; limit?: number } = {}
): MatchResult[] {
  const { minScore = 30, limit = 200 } = opts;
  const results: MatchResult[] = [];

  for (const property of properties) {
    for (const buyer of buyers) {
      const result = scoreMatch(property, buyer);
      if (result.score >= minScore) {
        results.push(result);
      }
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
