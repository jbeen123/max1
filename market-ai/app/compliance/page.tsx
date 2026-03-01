import { getRule } from "@/lib/compliance";

export default function CompliancePage() {
  const state = "FL";
  const rule = getRule(state);

  return (
    <section className="card">
      <h2>Compliance Center</h2>
      <p>Sample rule set for {state}. Expand by state before launch.</p>
      <p>
        Assignment default: <strong>{rule.assignmentAllowed ? "Allowed with disclosures" : "Restricted by default"}</strong>
      </p>
      <ul>
        {rule.checklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p style={{ color: "#fca5a5" }}>
        Legal note: this scaffold is operational tooling, not legal advice. Validate workflows with licensed counsel.
      </p>
    </section>
  );
}
