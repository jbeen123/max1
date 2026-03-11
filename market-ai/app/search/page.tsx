import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const state = sp.state || "";
  const zoning = sp.zoning || "";
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;

  const properties = await db.property.findMany({
    where: {
      status: { in: ["ACTIVE", "UNDER_CONTRACT"] },
      ...(state ? { state } : {}),
      ...(zoning ? { zoning } : {}),
      ...(minPrice || maxPrice ? { askingPrice: { gte: minPrice, lte: maxPrice } } : {}),
    },
    include: { seller: { select: { name: true, isVerified: true, company: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const states = ["TX", "FL", "GA", "NC", "AZ", "TN", "SC", "AL", "CO", "NV"];
  const zonings = ["Residential", "Agricultural", "Commercial", "Mixed-Use", "Industrial"];

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 .25rem" }}>Available Properties</h2>
        <p style={{ color: "#94a3b8", margin: 0 }}>{properties.length} listing{properties.length !== 1 ? "s" : ""} found</p>
      </div>

      {/* ── Filters ── */}
      <form method="GET" style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <select name="state" defaultValue={state} style={{ flex: 1, minWidth: 120 }}>
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="zoning" defaultValue={zoning} style={{ flex: 1, minWidth: 130 }}>
          <option value="">All Zoning</option>
          {zonings.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        <input name="minPrice" type="number" placeholder="Min Price ($)" defaultValue={sp.minPrice || ""} style={{ flex: 1, minWidth: 130 }} />
        <input name="maxPrice" type="number" placeholder="Max Price ($)" defaultValue={sp.maxPrice || ""} style={{ flex: 1, minWidth: 130 }} />
        <button type="submit" style={{ width: "auto", padding: ".6rem 1.5rem" }}>Filter</button>
        <a href="/search"><button type="button" className="ghost" style={{ width: "auto", padding: ".6rem 1rem" }}>Clear</button></a>
      </form>

      {/* ── Property Cards ── */}
      {properties.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          <p style={{ fontSize: "1.2rem" }}>No listings match your filters.</p>
          <a href="/search"><button className="ghost" style={{ width: "auto", marginTop: ".5rem" }}>Clear Filters</button></a>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {properties.map((p) => {
            const imgs = Array.isArray(p.images) ? p.images as string[] : [];
            const cover = p.coverImage || imgs[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";
            const statusColor = p.status === "ACTIVE" ? "#16a34a" : "#d97706";
            return (
              <Link key={p.id} href={`/property/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}>
                  {/* Image */}
                  <div style={{
                    height: 200, backgroundImage: `url(${cover})`,
                    backgroundSize: "cover", backgroundPosition: "center", position: "relative", flexShrink: 0,
                  }}>
                    <span style={{
                      position: "absolute", top: 10, left: 10, background: statusColor,
                      color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: ".7rem", fontWeight: 700,
                    }}>{p.status.replace("_", " ")}</span>
                    {p.assignmentAllowed && (
                      <span style={{
                        position: "absolute", top: 10, right: 10, background: "#7c3aed",
                        color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: ".7rem", fontWeight: 700,
                      }}>ASSIGNABLE</span>
                    )}
                    {imgs.length > 1 && (
                      <span style={{
                        position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,.6)",
                        color: "#fff", padding: "2px 8px", borderRadius: 999, fontSize: ".7rem",
                      }}>📷 {imgs.length}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ margin: "0 0 .35rem", fontSize: ".95rem", lineHeight: 1.4 }}>{p.title}</h3>
                    <p style={{ color: "#60a5fa", fontWeight: 800, fontSize: "1.2rem", margin: "0 0 .5rem" }}>
                      ${p.askingPrice.toLocaleString()}
                    </p>
                    <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginBottom: ".6rem" }}>
                      <span style={{ background: "#1e3a5f", color: "#93c5fd", padding: "2px 8px", borderRadius: 6, fontSize: ".75rem" }}>{p.state}</span>
                      <span style={{ background: "#1a2e1a", color: "#86efac", padding: "2px 8px", borderRadius: 6, fontSize: ".75rem" }}>{p.lotSizeAcres} acres</span>
                      <span style={{ background: "#2d1f3d", color: "#c4b5fd", padding: "2px 8px", borderRadius: 6, fontSize: ".75rem" }}>{p.zoning}</span>
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: ".8rem", margin: "0 0 .75rem", flex: 1, lineHeight: 1.5 }}>
                      {p.description.slice(0, 100)}…
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: "auto", paddingTop: ".5rem", borderTop: "1px solid #1f2937" }}>
                      <span style={{ fontSize: ".75rem", color: "#6b7280" }}>
                        {p.seller?.company || p.seller?.name || "Seller"}
                        {p.seller?.isVerified && <span style={{ color: "#16a34a", marginLeft: ".3rem" }}>✓ Verified</span>}
                      </span>
                      <span style={{ marginLeft: "auto", fontSize: ".75rem", color: "#60a5fa", fontWeight: 600 }}>View Details →</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
