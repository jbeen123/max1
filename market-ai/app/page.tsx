import Link from "next/link";

const stats = [
  ["Avg. moderation time", "< 4 hours"],
  ["Documented audit trail", "100%"],
  ["State-aware compliance rules", "Built-in"],
];

export default function HomePage() {
  return (
    <section className="grid" style={{ gap: "1.25rem" }}>
      <div className="hero card">
        <p className="eyebrow">Compliance-first real estate marketplace</p>
        <h1>market.ai</h1>
        <p className="lead">
          Connect land sellers and buyers with verified identities, compliant listing workflows, and contract-ready deal rooms.
        </p>
        <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <Link href="/login"><button>Get Started</button></Link>
          <Link href="/search"><button className="ghost">Browse Live Deals</button></Link>
        </div>
      </div>

      <div className="grid grid-3">
        {stats.map(([label, value]) => (
          <div className="card" key={label}>
            <p style={{ color: "#94a3b8", margin: 0 }}>{label}</p>
            <h3 style={{ margin: ".4rem 0 0" }}>{value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-2">
        <div className="card"><h3>Seller flow</h3><p>Create listing, upload docs, complete disclosures, then submit for moderation.</p></div>
        <div className="card"><h3>Buyer flow</h3><p>Filter deals by location and economics, submit offers, negotiate inside deal room.</p></div>
        <div className="card"><h3>Moderation</h3><p>Admin queue approves/rejects pending listings with notes for full traceability.</p></div>
        <div className="card"><h3>Offer negotiation</h3><p>Buyers submit offers, sellers counter, and both sides see offer history clearly.</p></div>
      </div>
    </section>
  );
}
