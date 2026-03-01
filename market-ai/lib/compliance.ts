type ComplianceRule = {
  assignmentAllowed: boolean;
  checklist: string[];
};

const rules: Record<string, ComplianceRule> = {
  FL: {
    assignmentAllowed: true,
    checklist: [
      "Disclose equitable interest status if not owner of record",
      "Do not market as broker/agent unless licensed",
      "Show contract assignment terms clearly to both sides",
    ],
  },
  CA: {
    assignmentAllowed: false,
    checklist: [
      "Require licensed broker flow unless direct principal transaction",
      "Flag assignment opportunities for legal review",
      "Collect explicit buyer/seller representation disclosures",
    ],
  },
};

export function getRule(state: string): ComplianceRule {
  return (
    rules[state.toUpperCase()] ?? {
      assignmentAllowed: false,
      checklist: [
        "Collect required agency/non-agency disclosures",
        "Verify state-specific licensing constraints",
        "Route assignment listings through legal review",
      ],
    }
  );
}
