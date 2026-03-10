/**
 * Contract Template Engine
 * Handles variable interpolation and template rendering.
 *
 * DISCLAIMER: These templates are for informational purposes only and do not
 * constitute legal advice. Consult a licensed real estate attorney.
 */

import { CLAUSES, getDefaultClauses } from "./clauses";

export type ContractType =
  | "PURCHASE_AGREEMENT"
  | "ASSIGNMENT_CONTRACT"
  | "OPTION_CONTRACT";

export interface TemplateVariables {
  // Parties
  buyerName: string;
  sellerName: string;
  buyerAddress?: string;
  sellerAddress?: string;
  // Property
  propertyAddress: string;
  parcelId?: string;
  state: string;
  county: string;
  // Financial
  purchasePrice: number;
  earnestMoney?: number;
  assignmentFee?: number;
  // Dates
  effectiveDate: string;   // YYYY-MM-DD
  closingDate: string;     // YYYY-MM-DD
  inspectionDays?: number;
  dueDiligenceDays?: number;
  financingDays?: number;
  titleReviewDays?: number;
  earnestMoneyDays?: number;
  // Contingencies
  loanAmount?: number;
  maxInterestRate?: number;
  loanTermYears?: number;
  // Other
  escrowAgent?: string;
  deedType?: string;
  titleExceptions?: string;
  knownEncumbrances?: string;
  assignmentNoticeDays?: number;
  [key: string]: string | number | undefined;
}

export interface BuiltInTemplate {
  id: string;
  name: string;
  type: ContractType;
  description: string;
  defaultClauses: string[];
  requiredVariables: string[];
}

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: "standard_purchase_agreement",
    name: "Standard Purchase Agreement",
    type: "PURCHASE_AGREEMENT",
    description:
      "A straightforward purchase and sale agreement suitable for land and vacant property transactions.",
    defaultClauses: [
      "inspection_contingency",
      "title_contingency",
      "financing_contingency",
      "earnest_money",
      "closing_date",
      "closing_costs",
      "default_remedies_buyer",
      "default_remedies_seller",
      "governing_law",
      "contract_template_disclaimer",
    ],
    requiredVariables: [
      "buyerName", "sellerName", "propertyAddress", "purchasePrice",
      "earnestMoney", "closingDate", "state", "county",
    ],
  },
  {
    id: "cash_purchase_agreement",
    name: "All-Cash Purchase Agreement (No Financing)",
    type: "PURCHASE_AGREEMENT",
    description:
      "Cash purchase with no financing contingency. Faster closing.",
    defaultClauses: [
      "cash_offer_no_financing",
      "inspection_contingency",
      "title_contingency",
      "earnest_money",
      "closing_date",
      "closing_costs",
      "default_remedies_buyer",
      "default_remedies_seller",
      "governing_law",
      "contract_template_disclaimer",
    ],
    requiredVariables: [
      "buyerName", "sellerName", "propertyAddress", "purchasePrice",
      "earnestMoney", "closingDate", "state", "county",
    ],
  },
  {
    id: "assignment_contract",
    name: "Assignment of Contract",
    type: "ASSIGNMENT_CONTRACT",
    description:
      "Assigns an existing purchase contract to a third-party end buyer. Includes assignment fee disclosure.",
    defaultClauses: [
      "assignment_and_or_assigns",
      "assignment_fee_disclosure",
      "earnest_money",
      "closing_date",
      "title_contingency",
      "as_is_disclosure",
      "default_remedies_buyer",
      "default_remedies_seller",
      "governing_law",
      "contract_template_disclaimer",
    ],
    requiredVariables: [
      "buyerName", "sellerName", "propertyAddress", "purchasePrice",
      "assignmentFee", "closingDate", "state", "county",
    ],
  },
  {
    id: "option_contract",
    name: "Option to Purchase Agreement",
    type: "OPTION_CONTRACT",
    description:
      "Gives the buyer an exclusive option to purchase within a set period. Useful for due diligence before committing.",
    defaultClauses: [
      "due_diligence_period",
      "inspection_contingency",
      "title_contingency",
      "earnest_money",
      "closing_date",
      "closing_costs",
      "default_remedies_buyer",
      "default_remedies_seller",
      "governing_law",
      "contract_template_disclaimer",
    ],
    requiredVariables: [
      "buyerName", "sellerName", "propertyAddress", "purchasePrice",
      "earnestMoney", "dueDiligenceDays", "closingDate", "state", "county",
    ],
  },
];

/**
 * Interpolate variables into a clause or template text.
 * Replaces {{variableName}} with the provided values.
 */
export function interpolate(
  text: string,
  variables: Record<string, string | number | undefined>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const val = variables[key];
    if (val === undefined || val === null) return `[${key}]`;
    if (typeof val === "number") return val.toLocaleString();
    return String(val);
  });
}

/**
 * Build the full contract text from a template and selected clauses.
 */
export function buildContract(
  template: BuiltInTemplate,
  selectedClauseIds: string[],
  variables: TemplateVariables
): string {
  const formattedDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const lines: string[] = [];

  lines.push(`================================================================================`);
  lines.push(`                    ${template.name.toUpperCase()}`);
  lines.push(`================================================================================`);
  lines.push(``);
  lines.push(`EFFECTIVE DATE: ${formattedDate(variables.effectiveDate)}`);
  lines.push(``);
  lines.push(`PARTIES:`);
  lines.push(`  BUYER:  ${variables.buyerName}`);
  if (variables.buyerAddress) lines.push(`          ${variables.buyerAddress}`);
  lines.push(`  SELLER: ${variables.sellerName}`);
  if (variables.sellerAddress) lines.push(`          ${variables.sellerAddress}`);
  lines.push(``);
  lines.push(`PROPERTY:`);
  lines.push(`  Address: ${variables.propertyAddress}`);
  lines.push(`  County:  ${variables.county}, ${variables.state}`);
  if (variables.parcelId) lines.push(`  Parcel ID: ${variables.parcelId}`);
  lines.push(``);
  lines.push(`PURCHASE PRICE: $${variables.purchasePrice.toLocaleString()}`);
  lines.push(``);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`TERMS AND CONDITIONS`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(``);

  let clauseNum = 1;
  for (const clauseId of selectedClauseIds) {
    const clause = CLAUSES[clauseId];
    if (!clause) continue;

    const text = interpolate(clause.text, variables as Record<string, string | number | undefined>);
    lines.push(`${clauseNum}. ${clause.name.toUpperCase()}`);
    lines.push(text);
    lines.push(``);
    clauseNum++;
  }

  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`SIGNATURES`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(``);
  lines.push(`BUYER SIGNATURE:`);
  lines.push(`________________________________     Date: _______________`);
  lines.push(`${variables.buyerName}`);
  lines.push(``);
  lines.push(`SELLER SIGNATURE:`);
  lines.push(`________________________________     Date: _______________`);
  lines.push(`${variables.sellerName}`);
  lines.push(``);
  lines.push(`================================================================================`);
  lines.push(`DISCLAIMER: This document was generated from a template for informational`);
  lines.push(`purposes only. It does not constitute legal advice. Consult a licensed real`);
  lines.push(`estate attorney before executing any contract.`);
  lines.push(`Generated by market.ai on ${new Date().toLocaleDateString()}`);
  lines.push(`================================================================================`);

  return lines.join("\n");
}

/**
 * Get a built-in template by ID
 */
export function getTemplate(id: string): BuiltInTemplate | null {
  return BUILT_IN_TEMPLATES.find((t) => t.id === id) ?? null;
}
