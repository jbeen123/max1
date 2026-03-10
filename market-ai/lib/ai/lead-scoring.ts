/**
 * Lead Scoring Engine
 * Scores property owners on their probability of selling.
 *
 * Signals used (with weights):
 *  - Tax delinquency            (20%)
 *  - Out-of-state owner         (15%)
 *  - Vacant property            (15%)
 *  - Pre-foreclosure / lis pendens (20%)
 *  - Estate / probate           (10%)
 *  - Length of ownership        (10%)
 *  - Equity position            (10%)
 */

export interface PropertyLeadInput {
  propertyId: string;
  // Tax
  taxStatus?: string;           // "current" | "delinquent" | "tax_sale"
  taxDelinquentYears?: number;
  // Owner
  isOutOfState?: boolean;
  isVacant?: boolean;
  // Legal
  hasLisPendens?: boolean;
  hasForeclosureNotice?: boolean;
  isEstateSale?: boolean;
  isProbate?: boolean;
  // Ownership
  ownershipDurationMonths?: number;   // how long owner has held it
  estimatedEquityPct?: number;        // 0–100 percent equity
}

export interface LeadSignal {
  name: string;
  present: boolean;
  weight: number;   // 0–1
  contribution: number; // weighted contribution to final score
  description: string;
}

export interface LeadScoreResult {
  propertyId: string;
  score: number;       // 0–100
  grade: "HOT" | "WARM" | "COOL" | "COLD";
  signals: LeadSignal[];
  summary: string;
}

export function scoreLead(input: PropertyLeadInput): LeadScoreResult {
  const signals: LeadSignal[] = [];

  // ── Tax Delinquency (20%) ───────────────────────────────────────────────
  let taxSignal = 0;
  const ts = (input.taxStatus ?? "current").toLowerCase();
  if (ts === "tax_sale" || ts === "tax sale") {
    taxSignal = 1.0;
  } else if (ts === "delinquent") {
    const years = input.taxDelinquentYears ?? 1;
    taxSignal = Math.min(1.0, 0.5 + years * 0.15);
  } else {
    taxSignal = 0.0;
  }
  signals.push({
    name: "tax_delinquency",
    present: taxSignal > 0,
    weight: 0.20,
    contribution: taxSignal * 0.20,
    description: taxSignal >= 0.8
      ? "Property in tax sale or severely delinquent"
      : taxSignal > 0
      ? `Tax delinquent (${input.taxDelinquentYears ?? 1} yr)`
      : "Taxes current",
  });

  // ── Out-of-State Owner (15%) ─────────────────────────────────────────────
  const oosScore = input.isOutOfState ? 1.0 : 0.0;
  signals.push({
    name: "out_of_state_owner",
    present: !!input.isOutOfState,
    weight: 0.15,
    contribution: oosScore * 0.15,
    description: input.isOutOfState
      ? "Owner mailing address is out-of-state (absentee)"
      : "Owner lives in-state",
  });

  // ── Vacant Property (15%) ────────────────────────────────────────────────
  const vacantScore = input.isVacant ? 1.0 : 0.0;
  signals.push({
    name: "vacant_property",
    present: !!input.isVacant,
    weight: 0.15,
    contribution: vacantScore * 0.15,
    description: input.isVacant ? "Property appears vacant" : "Property occupied",
  });

  // ── Pre-Foreclosure / Lis Pendens (20%) ─────────────────────────────────
  const foreclosureScore =
    input.hasForeclosureNotice ? 1.0 : input.hasLisPendens ? 0.7 : 0.0;
  signals.push({
    name: "pre_foreclosure",
    present: foreclosureScore > 0,
    weight: 0.20,
    contribution: foreclosureScore * 0.20,
    description: input.hasForeclosureNotice
      ? "Foreclosure notice filed"
      : input.hasLisPendens
      ? "Lis pendens recorded"
      : "No foreclosure signals",
  });

  // ── Estate / Probate (10%) ───────────────────────────────────────────────
  const estateScore =
    input.isProbate ? 1.0 : input.isEstateSale ? 0.8 : 0.0;
  signals.push({
    name: "estate_probate",
    present: estateScore > 0,
    weight: 0.10,
    contribution: estateScore * 0.10,
    description: input.isProbate
      ? "Property in probate"
      : input.isEstateSale
      ? "Estate sale"
      : "No estate/probate indicators",
  });

  // ── Length of Ownership (10%) ────────────────────────────────────────────
  // Very short (<12 mo) or very long (>240 mo / 20 yr) owners more likely to sell
  const months = input.ownershipDurationMonths ?? 60;
  let ownershipScore: number;
  if (months < 12) {
    ownershipScore = 0.4; // new owner – maybe flipping
  } else if (months >= 240) {
    ownershipScore = 0.9; // very long hold – heir or ready to cash out
  } else if (months >= 120) {
    ownershipScore = 0.6;
  } else {
    ownershipScore = 0.2;
  }
  signals.push({
    name: "ownership_duration",
    present: ownershipScore > 0.5,
    weight: 0.10,
    contribution: ownershipScore * 0.10,
    description: months >= 240
      ? `Owner held for ${Math.round(months / 12)} years – likely motivated`
      : months < 12
      ? "Recent acquisition – possible flip"
      : `Owned for ${Math.round(months / 12)} years`,
  });

  // ── Equity Position (10%) ───────────────────────────────────────────────
  // High equity = more room to sell, more likely to accept offers
  const equity = input.estimatedEquityPct ?? 50;
  let equityScore: number;
  if (equity >= 80) {
    equityScore = 1.0; // free and clear or near it
  } else if (equity >= 50) {
    equityScore = 0.7;
  } else if (equity >= 20) {
    equityScore = 0.4;
  } else {
    equityScore = 0.2; // underwater – harder to sell
  }
  signals.push({
    name: "equity_position",
    present: equityScore > 0.6,
    weight: 0.10,
    contribution: equityScore * 0.10,
    description: equity >= 80
      ? "High equity – owner has flexibility to sell at discount"
      : equity >= 50
      ? "Moderate equity position"
      : "Low equity – limited flexibility",
  });

  // ── Final Score ──────────────────────────────────────────────────────────
  const raw = signals.reduce((acc, s) => acc + s.contribution, 0);
  const score = Math.round(Math.min(100, raw * 100));

  const grade: LeadScoreResult["grade"] =
    score >= 70 ? "HOT" : score >= 45 ? "WARM" : score >= 25 ? "COOL" : "COLD";

  const hotSignals = signals.filter((s) => s.present).map((s) => s.name);
  const summary =
    hotSignals.length > 0
      ? `${grade} lead. Signals: ${hotSignals.join(", ")}.`
      : "No strong motivation signals detected.";

  return { propertyId: input.propertyId, score, grade, signals, summary };
}
