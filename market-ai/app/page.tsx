import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid" style={{ gap: "1.25rem" }}>
      <div className="card">
        <p style={{ margin: 0, color: "#a5b4fc", fontWeight: 600 }}>Compliance-first real estate marketplace</p>
        <h1 style={{ marginBottom: ".5rem" }}>market.ai</h1>
        <p style={{ color: "#cbd5e1" }}>
          Connect buyers and sellers of land + real estate with clear disclosures, verified users, and state-aware deal workflows.
        </p>
        <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
          <Link href="/submit"><button>List Property</button></Link>
          <Link href="/search"><button style={{ background: "transparent", borderColor: "#64748b" }}>Find Deals</button></Link>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card"><h3>Seller flow</h3><p>Create listing, upload docs, complete disclosures, receive offers.</p></div>
        <div className="card"><h3>Buyer flow</h3><p>Filter by state/county/zoning, submit offers, move into deal room.</p></div>
        <div className="card"><h3>Compliance</h3><p>Jurisdiction checks and assignment guardrails before listing goes live.</p></div>
        <div className="card"><h3>Operations</h3><p>Admin dashboard, moderation queue, and audit logs for every action.</p></div>
      </div>
    </section>
  );
}
