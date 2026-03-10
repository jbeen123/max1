/**
 * Library of legal contract clauses for real estate assignments.
 *
 * DISCLAIMER: These are template clauses for informational purposes only.
 * They do not constitute legal advice. Always have contracts reviewed by a
 * licensed real estate attorney in the applicable jurisdiction.
 */

export interface Clause {
  id: string;
  name: string;
  category: string;
  text: string;
  requiresState?: string[]; // only applies to these states
  incompatibleWith?: string[]; // mutually exclusive clause IDs
  variables?: string[];        // variable names used in this clause
}

export const CLAUSES: Record<string, Clause> = {
  // ── Assignment Clauses ──────────────────────────────────────────────────
  assignment_and_or_assigns: {
    id: "assignment_and_or_assigns",
    name: "Assignment – And/Or Assigns",
    category: "assignment",
    text: `Buyer: {{buyerName}} and/or assigns. Buyer reserves the right to assign this contract to any third party at Buyer's sole discretion without requiring Seller's consent, unless otherwise specified herein.`,
    variables: ["buyerName"],
  },

  assignment_with_notice: {
    id: "assignment_with_notice",
    name: "Assignment with Seller Notice",
    category: "assignment",
    text: `Buyer: {{buyerName}} and/or assigns. Buyer may assign this contract upon providing written notice to Seller no later than {{assignmentNoticedays}} days prior to closing. Seller acknowledges that an assignment does not release Buyer from primary liability under this contract.`,
    variables: ["buyerName", "assignmentNoticeDays"],
  },

  assignment_fee_disclosure: {
    id: "assignment_fee_disclosure",
    name: "Assignment Fee Disclosure",
    category: "assignment",
    text: `Buyer discloses that Buyer may receive an assignment fee of approximately \${{assignmentFee}} in connection with the assignment of this contract. This fee is paid by the assignee and does not affect the purchase price to be paid to Seller.`,
    variables: ["assignmentFee"],
  },

  // ── Inspection Contingencies ────────────────────────────────────────────
  inspection_contingency: {
    id: "inspection_contingency",
    name: "General Inspection Contingency",
    category: "contingency",
    text: `This contract is contingent upon Buyer's inspection and approval of the Property within {{inspectionDays}} days of the Effective Date ("Inspection Period"). If Buyer is not satisfied with the results of any inspection, Buyer may terminate this contract and receive a full refund of Earnest Money by providing written notice to Seller prior to the expiration of the Inspection Period.`,
    variables: ["inspectionDays"],
  },

  due_diligence_period: {
    id: "due_diligence_period",
    name: "Due Diligence Period",
    category: "contingency",
    text: `Buyer shall have {{dueDiligenceDays}} days from the Effective Date (the "Due Diligence Period") to conduct all inspections, investigations, surveys, and other due diligence activities at Buyer's expense. During this period, Buyer may terminate this contract for any reason or no reason by providing written notice to Seller.`,
    variables: ["dueDiligenceDays"],
  },

  // ── Title Contingencies ──────────────────────────────────────────────────
  title_contingency: {
    id: "title_contingency",
    name: "Title Contingency",
    category: "contingency",
    text: `This contract is contingent upon Buyer's review and approval of a title commitment or preliminary title report within {{titleReviewDays}} days of the Effective Date. Seller shall provide marketable title free and clear of all liens, encumbrances, and exceptions unacceptable to Buyer, except as specifically disclosed herein: {{titleExceptions}}.`,
    variables: ["titleReviewDays", "titleExceptions"],
  },

  clear_title_warranty: {
    id: "clear_title_warranty",
    name: "Clear Title Warranty",
    category: "title",
    text: `Seller warrants that Seller has marketable fee simple title to the Property, that the Property is free and clear of all liens, mortgages, judgments, and encumbrances except as follows: {{knownEncumbrances}}. Seller shall deliver title by {{deedType}} deed at closing.`,
    variables: ["knownEncumbrances", "deedType"],
  },

  // ── Financing Contingencies ──────────────────────────────────────────────
  financing_contingency: {
    id: "financing_contingency",
    name: "Financing Contingency",
    category: "contingency",
    text: "This contract is contingent upon Buyer obtaining a written commitment for financing of ${{loanAmount}} or more at an interest rate not to exceed {{maxInterestRate}}% per annum, with a loan term of {{loanTermYears}} years, within {{financingDays}} days of the Effective Date. If Buyer is unable to obtain such commitment after good faith effort, Buyer may terminate this contract and receive a full refund of Earnest Money.",
    variables: ["loanAmount", "maxInterestRate", "loanTermYears", "financingDays"],
  },

  cash_offer_no_financing: {
    id: "cash_offer_no_financing",
    name: "All-Cash / No Financing Contingency",
    category: "terms",
    text: `Buyer acknowledges that this is an all-cash offer and that no financing contingency applies. Buyer has sufficient funds in liquid or readily available form to complete this transaction.`,
  },

  // ── Earnest Money ────────────────────────────────────────────────────────
  earnest_money: {
    id: "earnest_money",
    name: "Earnest Money Deposit",
    category: "earnest_money",
    text: "Buyer shall deposit Earnest Money in the amount of ${{earnestMoney}} within {{earnestMoneyDays}} business days of the Effective Date. The Earnest Money shall be held in escrow by {{escrowAgent}} and applied toward the purchase price at closing. In the event of Buyer default, Seller may retain the Earnest Money as liquidated damages.",
    variables: ["earnestMoney", "earnestMoneyDays", "escrowAgent"],
  },

  // ── Closing Timeline ─────────────────────────────────────────────────────
  closing_date: {
    id: "closing_date",
    name: "Closing Date",
    category: "closing",
    text: `Closing shall occur on or before {{closingDate}}, or such other date as mutually agreed upon in writing by Buyer and Seller. Time is of the essence with respect to the closing date.`,
    variables: ["closingDate"],
  },

  closing_costs: {
    id: "closing_costs",
    name: "Closing Costs Allocation",
    category: "closing",
    text: `Seller shall pay: deed preparation, transfer taxes/stamps as required by {{state}} law, seller's attorney fees (if any), and any liens or encumbrances against the Property. Buyer shall pay: title insurance premium (if elected), recording fees, Buyer's attorney fees (if any), and all costs associated with Buyer's financing (if any).`,
    variables: ["state"],
  },

  // ── Default Remedies ─────────────────────────────────────────────────────
  default_remedies_buyer: {
    id: "default_remedies_buyer",
    name: "Default – Buyer",
    category: "default",
    text: `If Buyer defaults and fails to close on the scheduled closing date for reasons other than Seller default, Seller's sole remedy shall be retention of the Earnest Money as liquidated damages, unless the parties have expressly agreed otherwise in writing.`,
  },

  default_remedies_seller: {
    id: "default_remedies_seller",
    name: "Default – Seller",
    category: "default",
    text: `If Seller defaults, Buyer may: (a) terminate this contract and receive a full refund of Earnest Money, or (b) pursue specific performance or any other remedy available at law or equity.`,
  },

  // ── Governing Law ────────────────────────────────────────────────────────
  governing_law: {
    id: "governing_law",
    name: "Governing Law & Jurisdiction",
    category: "legal",
    text: `This contract shall be governed by and construed in accordance with the laws of the State of {{state}}. Any disputes arising out of or related to this contract shall be resolved in the courts of {{county}} County, {{state}}.`,
    variables: ["state", "county"],
  },

  arbitration: {
    id: "arbitration",
    name: "Arbitration Clause",
    category: "legal",
    text: `Any dispute, claim, or controversy arising out of or relating to this contract shall be settled by binding arbitration in accordance with the Commercial Arbitration Rules of the American Arbitration Association. Judgment upon the award may be entered in any court of competent jurisdiction.`,
  },

  // ── Disclosures ──────────────────────────────────────────────────────────
  as_is_disclosure: {
    id: "as_is_disclosure",
    name: "As-Is Sale Disclosure",
    category: "disclosure",
    text: `PROPERTY SOLD AS-IS: Buyer acknowledges that the Property is being sold "AS-IS, WHERE-IS" with all faults. Seller makes no representations or warranties, express or implied, regarding the condition of the Property. Buyer is relying solely on Buyer's own investigation and inspection.`,
  },

  lead_paint_disclosure: {
    id: "lead_paint_disclosure",
    name: "Lead Paint Disclosure (Pre-1978)",
    category: "disclosure",
    text: `LEAD WARNING STATEMENT (Federal Requirement): Every buyer of any interest in residential real property on which a residential dwelling was built prior to 1978 is notified that such property may present exposure to lead from lead-based paint that may place young children at risk of developing lead poisoning. Seller has/has not (circle one) knowledge of lead-based paint in the Property. Buyer has received the EPA pamphlet "Protect Your Family From Lead in Your Home."`,
  },

  contract_template_disclaimer: {
    id: "contract_template_disclaimer",
    name: "Template Disclaimer",
    category: "disclaimer",
    text: `IMPORTANT NOTICE: This document is a template for informational and educational purposes only. It does not constitute legal advice and should not be used without review by a licensed real estate attorney familiar with the laws of {{state}}. Real estate laws vary significantly by state and locality. Neither market.ai nor its affiliates are responsible for legal compliance of this document.`,
    variables: ["state"],
  },
};

/** Get all clauses for a given category */
export function getClausesByCategory(category: string): Clause[] {
  return Object.values(CLAUSES).filter((c) => c.category === category);
}

/** Get standard clause set for a contract type */
export function getDefaultClauses(
  contractType: "PURCHASE_AGREEMENT" | "ASSIGNMENT_CONTRACT" | "OPTION_CONTRACT",
  state: string
): string[] {
  const base = [
    "earnest_money",
    "closing_date",
    "closing_costs",
    "title_contingency",
    "default_remedies_buyer",
    "default_remedies_seller",
    "governing_law",
    "contract_template_disclaimer",
  ];

  if (contractType === "ASSIGNMENT_CONTRACT") {
    return [
      "assignment_and_or_assigns",
      "assignment_fee_disclosure",
      ...base,
      "as_is_disclosure",
    ];
  }

  if (contractType === "OPTION_CONTRACT") {
    return [
      "inspection_contingency",
      "due_diligence_period",
      ...base,
    ];
  }

  // PURCHASE_AGREEMENT
  return [
    "inspection_contingency",
    "title_contingency",
    "financing_contingency",
    ...base,
  ];
}
