import Link from "next/link";
import { PUBLIC_BUYER_FIELDS, PUBLIC_LAND_FIELDS, PUBLIC_SELLER_FIELDS } from "@/lib/public-info";

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

      <div className="card">
        <h3>Public Information Coverage</h3>
        <p style={{ color: "#94a3b8" }}>
          Marketplace now supports public profiles for buyers/sellers and public land details for active listings.
        </p>
        <p>
          Sellers: {PUBLIC_SELLER_FIELDS.length} fields · Buyers: {PUBLIC_BUYER_FIELDS.length} fields · Land: {PUBLIC_LAND_FIELDS.length} fields
        </p>
        <Link href="/public-info"><button className="ghost">View Public Info Directory</button></Link>
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <h3>Live Market Snapshot</h3>
        <p style={{ color: "#94a3b8" }}>Homepage HTML block added for market.ai visibility and status messaging.</p>
        <div style={{ border: "1px solid #1f2937", borderRadius: "12px", padding: "1rem", background: "#0b1220" }}>
          <p style={{ margin: 0, fontSize: ".85rem", color: "#93c5fd" }}>System Status</p>
          <h4 style={{ margin: ".35rem 0 .65rem" }}>Online · Awaiting live data feed connection</h4>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#cbd5e1" }}>
            <li>Domain: market.ai</li>
            <li>Frontend: Next.js app</li>
            <li>Realtime: connect WebSocket/API to replace this placeholder</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
