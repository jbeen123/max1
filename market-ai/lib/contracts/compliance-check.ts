/**
 * Contract Compliance Checker
 * Validates contracts against state-specific rules.
 *
 * NOTE: This is a reference implementation. State laws change frequently.
 * Always consult a licensed real estate attorney for legal compliance.
 */

export interface ComplianceIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  state?: string;
}

export interface ComplianceResult {
  passed: boolean;
  issues: ComplianceIssue[];
}

/** State-specific rules */
const STATE_RULES: Record<string, {
  maxAssignmentFee?: number;
  requiresAttorneyReview?: boolean;
  requiresLicensedBroker?: boolean;
  assignmentRestrictions?: string;
  requiredDisclosures?: string[];
  notes?: string;
}> = {
  TX: {
    notes: "Texas: Assignment contracts generally permitted. Use TREC-approved forms for broker-involved transactions.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  FL: {
    notes: "Florida: Assignment contracts allowed. Disclosure of assignment fee to seller recommended.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  CA: {
    requiresAttorneyReview: true,
    assignmentRestrictions: "California has strict disclosure requirements. The seller must be informed of the assignment.",
    notes: "California: Recommend attorney review. Disclosure laws are extensive.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  NY: {
    requiresAttorneyReview: true,
    notes: "New York: Attorney involvement strongly recommended for real estate contracts.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  IL: {
    notes: "Illinois: Assignments generally permitted. Attorney review period (5 business days) may apply.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  NC: {
    notes: "North Carolina: Use NC Bar Association approved forms where possible.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  GA: {
    notes: "Georgia: Assignment contracts commonly used. Disclosure of assignment fee recommended.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  AZ: {
    notes: "Arizona: Assignment contracts generally permitted.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  OH: {
    notes: "Ohio: Assignment contracts allowed.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  PA: {
    requiresAttorneyReview: true,
    notes: "Pennsylvania: Attorney review recommended.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  NJ: {
    requiresAttorneyReview: true,
    notes: "New Jersey: Attorney review period (3 business days) applies to most residential contracts.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  MO: {
    notes: "Missouri: Assignment contracts generally permitted.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  TN: {
    notes: "Tennessee: Assignment contracts commonly used in wholesale transactions.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  CO: {
    notes: "Colorado: Use Colorado Real Estate Commission approved forms for broker transactions.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
  WA: {
    notes: "Washington: Assignment contracts generally permitted.",
    requiredDisclosures: ["lead_paint_disclosure"],
  },
};

interface ValidationInput {
  state: string;
  contractType: "PURCHASE_AGREEMENT" | "ASSIGNMENT_CONTRACT" | "OPTION_CONTRACT";
  variables: Record<string, string | number>;
  selectedClauseIds: string[];
  isPreBuilt1978?: boolean; // property built before 1978?
}

export function checkCompliance(input: ValidationInput): ComplianceResult {
  const issues: ComplianceIssue[] = [];
  const { state, contractType, variables, selectedClauseIds } = input;

  // ── Universal checks ────────────────────────────────────────────────────

  // Earnest money sanity check
  if (variables.earnestMoney) {
    const em = Number(variables.earnestMoney);
    const price = Number(variables.purchasePrice ?? 0);
    if (em <= 0) {
      issues.push({
        severity: "error",
        code: "EM_ZERO",
        message: "Earnest money must be greater than $0.",
      });
    }
    if (price > 0 && em > price * 0.5) {
      issues.push({
        severity: "warning",
        code: "EM_HIGH",
        message: "Earnest money exceeds 50% of purchase price, which is unusual.",
      });
    }
  }

  // Closing date in the past
  if (variables.closingDate) {
    const closing = new Date(String(variables.closingDate));
    if (closing < new Date()) {
      issues.push({
        severity: "error",
        code: "CLOSING_DATE_PAST",
        message: "Closing date must be in the future.",
      });
    }
  }

  // Missing assignment fee disclosure
  if (
    contractType === "ASSIGNMENT_CONTRACT" &&
    !selectedClauseIds.includes("assignment_fee_disclosure")
  ) {
    issues.push({
      severity: "warning",
      code: "MISSING_ASSIGNMENT_FEE_DISCLOSURE",
      message:
        "Assignment contracts should include an assignment fee disclosure clause for transparency.",
    });
  }

  // Lead paint disclosure for pre-1978 properties
  if (
    input.isPreBuilt1978 &&
    !selectedClauseIds.includes("lead_paint_disclosure")
  ) {
    issues.push({
      severity: "error",
      code: "MISSING_LEAD_PAINT_DISCLOSURE",
      message:
        "Federal law requires a lead paint disclosure for residential properties built before 1978.",
    });
  }

  // Template disclaimer should always be present
  if (!selectedClauseIds.includes("contract_template_disclaimer")) {
    issues.push({
      severity: "warning",
      code: "MISSING_DISCLAIMER",
      message: "The template disclaimer clause should be included in all contracts.",
    });
  }

  // ── State-specific checks ───────────────────────────────────────────────
  const stateRule = STATE_RULES[state.toUpperCase()];
  if (stateRule) {
    if (stateRule.requiresAttorneyReview) {
      issues.push({
        severity: "warning",
        code: "ATTORNEY_REVIEW_RECOMMENDED",
        message: `${state}: Attorney review is strongly recommended or legally required. ${stateRule.notes ?? ""}`,
        state,
      });
    }

    if (stateRule.assignmentRestrictions) {
      issues.push({
        severity: "info",
        code: "STATE_ASSIGNMENT_NOTE",
        message: stateRule.assignmentRestrictions,
        state,
      });
    }

    if (stateRule.maxAssignmentFee && variables.assignmentFee) {
      const fee = Number(variables.assignmentFee);
      if (fee > stateRule.maxAssignmentFee) {
        issues.push({
          severity: "warning",
          code: "ASSIGNMENT_FEE_HIGH",
          message: `${state} may restrict assignment fees above $${stateRule.maxAssignmentFee.toLocaleString()}. Verify with a local attorney.`,
          state,
        });
      }
    }

    if (stateRule.notes) {
      issues.push({
        severity: "info",
        code: "STATE_NOTE",
        message: stateRule.notes,
        state,
      });
    }
  } else {
    issues.push({
      severity: "info",
      code: "STATE_UNKNOWN",
      message: `State-specific rules for ${state} are not in our database. Please consult a local attorney.`,
      state,
    });
  }

  // Pass if no errors
  const passed = !issues.some((i) => i.severity === "error");

  return { passed, issues };
}

/** Get state-specific notes */
export function getStateNotes(state: string): string | null {
  return STATE_RULES[state.toUpperCase()]?.notes ?? null;
}

/** List of states with known restrictions */
export function getHighCautionStates(): string[] {
  return Object.entries(STATE_RULES)
    .filter(([, r]) => r.requiresAttorneyReview || r.requiresLicensedBroker)
    .map(([s]) => s);
}
