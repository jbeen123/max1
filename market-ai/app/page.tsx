import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [userCount, listingCount, activeCount] = await Promise.all([
    db.user.count(),
    db.property.count(),
    db.property.count({ where: { status: "ACTIVE" } }),
  ]);

  const featured = await db.property.findMany({
    where: { status: "ACTIVE", coverImage: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Hero ── */}
      <div style={{
        textAlign: "center", padding: "4rem 1.5rem 3rem",
        background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(139,92,246,0.08) 100%)",
        borderRadius: 16, marginBottom: "2rem",
      }}>
        <p style={{ color: "#60a5fa", fontWeight: 600, letterSpacing: 1.5, fontSize: ".8rem", textTransform: "uppercase", marginBottom: ".75rem" }}>
          Compliance-First Real Estate Marketplace
        </p>
        <h1 style={{ fontSize: "2.75rem", fontWeight: 800, margin: "0 0 1rem", lineHeight: 1.15 }}>
          Buy &amp; Sell Land with<br />
          <span style={{ color: "#60a5fa" }}>Confidence</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto 2rem" }}>
          Verified identities. Transparent pricing. Compliant deal rooms. Connect with serious land investors, builders, and sellers across the United States.
        </p>
        <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login"><button style={{ padding: ".75rem 2rem", fontSize: "1rem" }}>Get Started Free</button></Link>
          <Link href="/search"><button className="ghost" style={{ padding: ".75rem 2rem", fontSize: "1rem" }}>Browse Properties</button></Link>
          <Link href="/investors"><button className="ghost" style={{ padding: ".75rem 2rem", fontSize: "1rem" }}>View Buyers &amp; Investors</button></Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        {[
          [String(userCount), "Registered Users"],
          [String(activeCount), "Active Listings"],
          [String(listingCount), "Total Listings"],
          ["< 4hr", "Avg. Moderation Time"],
        ].map(([val, label]) => (
          <div key={label} className="card" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#60a5fa" }}>{val}</div>
            <div style={{ color: "#94a3b8", fontSize: ".85rem", marginTop: ".25rem" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── How it works ── */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {[
            ["🏠", "List Your Property", "Submit your land or property with details, disclosures, and pricing. Our team reviews every listing for compliance."],
            ["🔍", "Find & Connect", "Search properties by location, size, zoning, and price. View verified seller profiles and property photos."],
            ["🤝", "Close the Deal", "Submit offers, negotiate in the deal room, sign contracts electronically, and process payments — all in one place."],
          ].map(([icon, title, desc]) => (
            <div key={title} className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>{icon}</div>
              <h3 style={{ margin: "0 0 .5rem", fontSize: "1.1rem" }}>{title}</h3>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: ".9rem", lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured Properties ── */}
      {featured.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0 }}>Featured Properties</h2>
            <Link href="/search"><button className="ghost" style={{ width: "auto" }}>View All →</button></Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {featured.map((p) => (
              <Link key={p.id} href={`/property/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer", transition: "transform .15s", height: "100%" }}>
                  <div style={{
                    height: 180, backgroundImage: `url(${p.coverImage})`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    position: "relative",
                  }}>
                    <span style={{
                      position: "absolute", top: 10, right: 10, background: "#16a34a", color: "#fff",
                      padding: "2px 10px", borderRadius: 999, fontSize: ".75rem", fontWeight: 600,
                    }}>ACTIVE</span>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h4 style={{ margin: "0 0 .35rem", fontSize: ".95rem" }}>{p.title}</h4>
                    <p style={{ color: "#60a5fa", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 .25rem" }}>
                      ${p.askingPrice.toLocaleString()}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: ".8rem", margin: 0 }}>
                      {p.county}, {p.state} · {p.lotSizeAcres} acres · {p.zoning}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── For Buyers / Sellers ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
        <div className="card" style={{ padding: "2rem" }}>
          <h3 style={{ color: "#60a5fa", margin: "0 0 .75rem" }}>For Buyers &amp; Investors</h3>
          <ul style={{ color: "#cbd5e1", lineHeight: 1.8, paddingLeft: "1.25rem", margin: 0 }}>
            <li>AI-powered property matching</li>
            <li>Verified seller identities (KYC)</li>
            <li>Public records &amp; parcel data</li>
            <li>Electronic contracts &amp; e-signing</li>
            <li>Secure earnest money via Stripe</li>
          </ul>
          <Link href="/login"><button className="ghost" style={{ marginTop: "1rem", width: "auto" }}>Register as Buyer →</button></Link>
        </div>
        <div className="card" style={{ padding: "2rem" }}>
          <h3 style={{ color: "#a78bfa", margin: "0 0 .75rem" }}>For Sellers</h3>
          <ul style={{ color: "#cbd5e1", lineHeight: 1.8, paddingLeft: "1.25rem", margin: 0 }}>
            <li>Free listing submission</li>
            <li>Expert moderation review</li>
            <li>Compliance-ready disclosures</li>
            <li>Direct offers from verified buyers</li>
            <li>Payouts via Stripe Connect</li>
          </ul>
          <Link href="/login"><button className="ghost" style={{ marginTop: "1rem", width: "auto" }}>List Your Property →</button></Link>
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className="card" style={{ textAlign: "center", padding: "2rem", marginBottom: "2.5rem" }}>
        <h3 style={{ margin: "0 0 1rem" }}>Built on Trust</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap", color: "#94a3b8", fontSize: ".9rem" }}>
          <div>🔒 End-to-End Encryption</div>
          <div>✅ KYC Identity Verification</div>
          <div>📋 Tamper-Proof Audit Logs</div>
          <div>⚖️ State Compliance Built-In</div>
        </div>
      </div>

    </section>
  );
}
