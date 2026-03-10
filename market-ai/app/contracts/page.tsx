"use client";

import { useEffect, useState } from "react";

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  defaultClauses: string[];
  requiredVariables: string[];
}

interface Clause {
  id: string;
  name: string;
  category: string;
  text: string;
}

interface ComplianceIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
}

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

type Step = "select" | "customize" | "variables" | "preview" | "done";

export default function ContractsPage() {
  const [step, setStep] = useState<Step>("select");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({
    effectiveDate: new Date().toISOString().split("T")[0],
    closingDate: "",
    inspectionDays: "14",
    dueDiligenceDays: "21",
    financingDays: "21",
    titleReviewDays: "10",
    earnestMoneyDays: "3",
    deedType: "Warranty",
    escrowAgent: "Title Company",
    titleExceptions: "None",
    knownEncumbrances: "None",
    assignmentNoticeDays: "5",
  });
  const [previewContent, setPreviewContent] = useState<string>("");
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedContractId, setSavedContractId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contracts/templates")
      .then((r) => r.json())
      .then((d) => {
        setTemplates(d.templates ?? []);
        setClauses(d.clauses ?? []);
      });
  }, []);

  function selectTemplate(t: Template) {
    setSelectedTemplate(t);
    setSelectedClauses([...t.defaultClauses]);
    setStep("customize");
  }

  function toggleClause(id: string) {
    setSelectedClauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function setVar(key: string, val: string) {
    setVariables((prev) => ({ ...prev, [key]: val }));
  }

  async function generatePreview() {
    if (!selectedTemplate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          variables: {
            ...variables,
            purchasePrice: Number(variables.purchasePrice ?? 0),
            earnestMoney: Number(variables.earnestMoney ?? 0),
            assignmentFee: Number(variables.assignmentFee ?? 0),
            loanAmount: Number(variables.loanAmount ?? 0),
            maxInterestRate: Number(variables.maxInterestRate ?? 7),
            loanTermYears: Number(variables.loanTermYears ?? 30),
          },
          selectedClauseIds: selectedClauses,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate contract.");
        return;
      }
      setPreviewContent(data.contract?.finalContent ?? "");
      setComplianceIssues(data.compliance?.issues ?? []);
      setSavedContractId(data.contract?.id ?? null);
      setStep("preview");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function downloadContract() {
    const blob = new Blob([previewContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract_${selectedTemplate?.id ?? "draft"}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const clausesByCategory = clauses.reduce<Record<string, Clause[]>>((acc, c) => {
    (acc[c.category] = acc[c.category] ?? []).push(c);
    return acc;
  }, {});

  return (
    <section className="grid" style={{ gap: "1.25rem" }}>
      {/* Header */}
      <div className="card hero">
        <p className="eyebrow">Legal</p>
        <h1 style={{ margin: ".25rem 0 .5rem", fontSize: "1.6rem" }}>Contract Builder</h1>
        <p className="lead">
          Generate real estate purchase agreements, assignment contracts, and option
          contracts. Templates stay compliant without requiring a broker license.
        </p>
        <div style={{
          marginTop: ".75rem",
          padding: ".6rem .9rem",
          background: "#1e293b",
          borderRadius: "8px",
          border: "1px solid #f59e0b44",
          color: "#fcd34d",
          fontSize: ".82rem",
        }}>
          ⚠️ <strong>Legal Disclaimer:</strong> These templates are for informational purposes
          only and do not constitute legal advice. Always consult a licensed real estate
          attorney before signing any contract.
        </div>
      </div>

      {/* Step indicator */}
      <div className="card" style={{ padding: ".6rem 1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", fontSize: ".85rem" }}>
          {(["select", "customize", "variables", "preview"] as Step[]).map((s, i) => (
            <span key={s} style={{
              color: step === s ? "#93c5fd" : s === "done" ? "#22c55e" : "#64748b",
              fontWeight: step === s ? 600 : 400,
            }}>
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1: Select Template */}
      {step === "select" && (
        <div className="grid grid-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="card"
              style={{ cursor: "pointer", transition: "border-color .2s" }}
              onClick={() => selectTemplate(t)}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#263044")}
            >
              <div style={{ fontSize: ".75rem", color: "#93c5fd", fontWeight: 600, marginBottom: ".35rem", textTransform: "uppercase" }}>
                {t.type.replace(/_/g, " ")}
              </div>
              <h3 style={{ margin: "0 0 .5rem", fontSize: "1rem" }}>{t.name}</h3>
              <p style={{ color: "#94a3b8", fontSize: ".88rem", margin: 0 }}>{t.description}</p>
              <div style={{ marginTop: ".75rem" }}>
                <button style={{ width: "auto", padding: ".45rem .9rem", fontSize: ".85rem" }}>
                  Use This Template →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Customize Clauses */}
      {step === "customize" && selectedTemplate && (
        <>
          <div className="card">
            <h3 style={{ margin: "0 0 .75rem" }}>Customize Clauses for: {selectedTemplate.name}</h3>
            {Object.entries(clausesByCategory).map(([cat, catClauses]) => (
              <div key={cat} style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: ".75rem", color: "#93c5fd", fontWeight: 600, textTransform: "uppercase", marginBottom: ".5rem" }}>
                  {cat.replace(/_/g, " ")}
                </div>
                {catClauses.map((c) => (
                  <label key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: ".5rem", marginBottom: ".4rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedClauses.includes(c.id)}
                      onChange={() => toggleClause(c.id)}
                      style={{ width: "auto", marginTop: ".15rem" }}
                    />
                    <div>
                      <div style={{ fontSize: ".88rem", color: "#e2e8f0" }}>{c.name}</div>
                      <div style={{ fontSize: ".78rem", color: "#64748b", marginTop: ".1rem" }}>
                        {c.text.slice(0, 100)}…
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ))}
            <div style={{ display: "flex", gap: ".75rem", marginTop: ".5rem" }}>
              <button className="ghost" onClick={() => setStep("select")} style={{ width: "auto" }}>
                ← Back
              </button>
              <button onClick={() => setStep("variables")} style={{ width: "auto" }}>
                Next: Fill Variables →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 3: Variables */}
      {step === "variables" && selectedTemplate && (
        <div className="card">
          <h3 style={{ margin: "0 0 .75rem" }}>Contract Details</h3>
          <div className="grid grid-2" style={{ gap: ".75rem" }}>
            {[
              { key: "buyerName", label: "Buyer Name", required: true },
              { key: "sellerName", label: "Seller Name", required: true },
              { key: "buyerAddress", label: "Buyer Address" },
              { key: "sellerAddress", label: "Seller Address" },
              { key: "propertyAddress", label: "Property Address", required: true },
              { key: "parcelId", label: "Parcel ID" },
              { key: "county", label: "County", required: true },
              { key: "purchasePrice", label: "Purchase Price ($)", required: true, type: "number" },
              { key: "earnestMoney", label: "Earnest Money ($)", type: "number" },
              { key: "assignmentFee", label: "Assignment Fee ($)", type: "number" },
              { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
              { key: "closingDate", label: "Closing Date", type: "date", required: true },
              { key: "inspectionDays", label: "Inspection Period (days)", type: "number" },
              { key: "dueDiligenceDays", label: "Due Diligence (days)", type: "number" },
              { key: "financingDays", label: "Financing Contingency (days)", type: "number" },
              { key: "earnestMoneyDays", label: "Earnest Money Due (business days)", type: "number" },
              { key: "loanAmount", label: "Loan Amount ($)", type: "number" },
              { key: "maxInterestRate", label: "Max Interest Rate (%)", type: "number" },
              { key: "loanTermYears", label: "Loan Term (years)", type: "number" },
              { key: "escrowAgent", label: "Escrow / Title Company" },
              { key: "deedType", label: "Deed Type (e.g. Warranty, Quitclaim)" },
            ].map(({ key, label, required, type }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: ".82rem", color: "#94a3b8", marginBottom: ".25rem" }}>
                  {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
                </label>
                {key === "state" ? (
                  <select value={variables[key] ?? ""} onChange={(e) => setVar(key, e.target.value)}>
                    <option value="">Select state…</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input
                    type={type ?? "text"}
                    value={variables[key] ?? ""}
                    onChange={(e) => setVar(key, e.target.value)}
                    placeholder={label}
                  />
                )}
              </div>
            ))}
            {/* State dropdown separately */}
            <div>
              <label style={{ display: "block", fontSize: ".82rem", color: "#94a3b8", marginBottom: ".25rem" }}>
                State <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select value={variables.state ?? ""} onChange={(e) => setVar("state", e.target.value)}>
                <option value="">Select state…</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: ".75rem", color: "#fca5a5", fontSize: ".85rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
            <button className="ghost" onClick={() => setStep("customize")} style={{ width: "auto" }}>
              ← Back
            </button>
            <button onClick={generatePreview} disabled={loading} style={{ width: "auto" }}>
              {loading ? "Generating…" : "Preview Contract →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === "preview" && (
        <>
          {/* Compliance Issues */}
          {complianceIssues.length > 0 && (
            <div className="card" style={{ borderColor: "#f59e0b55" }}>
              <h3 style={{ margin: "0 0 .75rem", color: "#fcd34d" }}>⚠ Compliance Notes</h3>
              <div style={{ display: "grid", gap: ".5rem" }}>
                {complianceIssues.map((issue, i) => (
                  <div key={i} style={{
                    padding: ".5rem .75rem",
                    borderRadius: "8px",
                    background: issue.severity === "error"
                      ? "#ef444422" : issue.severity === "warning"
                      ? "#f59e0b22" : "#3b82f622",
                    borderLeft: `3px solid ${issue.severity === "error" ? "#ef4444" : issue.severity === "warning" ? "#f59e0b" : "#3b82f6"}`,
                    fontSize: ".85rem",
                    color: "#e2e8f0",
                  }}>
                    <strong style={{ textTransform: "uppercase", fontSize: ".75rem" }}>
                      {issue.severity}
                    </strong>{" "}
                    {issue.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contract preview */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".75rem", flexWrap: "wrap", gap: ".5rem" }}>
              <h3 style={{ margin: 0 }}>Contract Preview</h3>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button className="ghost" onClick={() => setStep("variables")} style={{ width: "auto" }}>
                  ← Edit
                </button>
                <button onClick={downloadContract} style={{ width: "auto" }}>
                  ⬇ Download .txt
                </button>
              </div>
            </div>
            <pre style={{
              background: "#0f1728",
              border: "1px solid #263044",
              borderRadius: "10px",
              padding: "1rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: ".82rem",
              color: "#cbd5e1",
              maxHeight: "600px",
              overflowY: "auto",
              lineHeight: "1.6",
            }}>
              {previewContent}
            </pre>
            {savedContractId && (
              <p style={{ color: "#64748b", fontSize: ".82rem", marginTop: ".75rem" }}>
                ✓ Saved as contract ID: {savedContractId}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
