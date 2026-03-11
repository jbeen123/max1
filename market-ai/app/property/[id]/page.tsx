import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await db.property.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, email: true, isVerified: true, phone: true, company: true, bio: true, avatarUrl: true, state: true } },
      offers: { orderBy: { createdAt: "desc" }, take: 5 },
      matchScores: { orderBy: { score: "desc" }, take: 3 },
    },
  });

  if (!property) return notFound();

  const imgs = Array.isArray(property.images) ? property.images as string[] : [];
  const cover = property.coverImage || imgs[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";
  const statusColor = property.status === "ACTIVE" ? "#16a34a" : property.status === "UNDER_CONTRACT" ? "#d97706" : "#6b7280";

  return (
    <section style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/search" style={{ color: "#60a5fa", fontSize: ".875rem" }}>← Back to Search</Link>
      </div>

      {/* ── Hero image ── */}
      <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem", height: 380, position: "relative" }}>
        <img src={cover} alt={property.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)",
        }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, padding: "1.5rem" }}>
          <span style={{ background: statusColor, color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: ".75rem", fontWeight: 700 }}>
            {property.status.replace("_", " ")}
          </span>
          <h1 style={{ color: "#fff", margin: ".5rem 0 .25rem", fontSize: "1.6rem", fontWeight: 800 }}>{property.title}</h1>
          <p style={{ color: "#cbd5e1", margin: 0 }}>{property.county}, {property.state}</p>
        </div>
      </div>

      {/* ── Thumbnail strip ── */}
      {imgs.length > 1 && (
        <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.5rem", overflowX: "auto" }}>
          {imgs.map((img, i) => (
            <img key={i} src={img} alt="" style={{ height: 80, width: 120, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem" }}>
        {/* ── Left column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Price + key stats */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "#60a5fa" }}>${property.askingPrice.toLocaleString()}</span>
              {property.lotSizeAcres && (
                <span style={{ color: "#94a3b8" }}>${Math.round(property.askingPrice / property.lotSizeAcres).toLocaleString()}/acre</span>
              )}
              {property.assignmentAllowed && (
                <span style={{ background: "#7c3aed", color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: ".75rem" }}>ASSIGNABLE</span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: ".75rem", marginTop: "1rem" }}>
              {[
                ["📍", "Location", `${property.county}, ${property.state}`],
                ["📐", "Size", `${property.lotSizeAcres} acres`],
                ["🏗️", "Zoning", property.zoning || "N/A"],
                ["📋", "Parcel ID", property.parcelId || "N/A"],
                ["📊", "Status", property.status.replace("_", " ")],
                ["🔄", "Assignable", property.assignmentAllowed ? "Yes" : "No"],
              ].map(([icon, label, value]) => (
                <div key={label} style={{ background: "#111827", borderRadius: 8, padding: ".75rem" }}>
                  <div style={{ fontSize: ".75rem", color: "#6b7280", marginBottom: ".2rem" }}>{icon} {label}</div>
                  <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ margin: "0 0 .75rem" }}>Property Description</h3>
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>{property.description}</p>
          </div>

          {/* AI Match indicator */}
          {property.matchScores.length > 0 && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ margin: "0 0 .75rem" }}>🎯 AI Match Score</h3>
              <p style={{ color: "#94a3b8", fontSize: ".875rem", margin: "0 0 .75rem" }}>Top buyer matches for this property</p>
              {property.matchScores.map((m) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".5rem" }}>
                  <div style={{ flex: 1, background: "#1f2937", borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${m.score}%`, height: "100%", background: m.score > 75 ? "#16a34a" : m.score > 50 ? "#d97706" : "#6b7280", borderRadius: 6 }} />
                  </div>
                  <span style={{ fontSize: ".8rem", fontWeight: 600, minWidth: 40 }}>{Math.round(m.score)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Seller card */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h4 style={{ margin: "0 0 1rem", color: "#94a3b8", fontSize: ".8rem", textTransform: "uppercase", letterSpacing: 1 }}>Listed By</h4>
            <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
              {property.seller?.avatarUrl ? (
                <img src={property.seller.avatarUrl} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>👤</div>
              )}
              <div>
                <div style={{ fontWeight: 700 }}>
                  {property.seller?.name}
                  {property.seller?.isVerified && <span style={{ color: "#16a34a", marginLeft: ".4rem", fontSize: ".8rem" }}>✓</span>}
                </div>
                {property.seller?.company && <div style={{ color: "#94a3b8", fontSize: ".8rem" }}>{property.seller.company}</div>}
              </div>
            </div>
            {property.seller?.bio && (
              <p style={{ color: "#94a3b8", fontSize: ".8rem", marginTop: ".75rem", lineHeight: 1.5 }}>{property.seller.bio.slice(0, 120)}…</p>
            )}
            {property.seller?.phone && (
              <div style={{ marginTop: ".75rem", padding: ".6rem .75rem", background: "#111827", borderRadius: 8, fontSize: ".875rem" }}>
                📞 {property.seller.phone}
              </div>
            )}
            {property.seller?.email && (
              <div style={{ marginTop: ".5rem", padding: ".6rem .75rem", background: "#111827", borderRadius: 8, fontSize: ".875rem", wordBreak: "break-all" }}>
                ✉️ {property.seller.email}
              </div>
            )}
          </div>

          {/* Make offer CTA */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h4 style={{ margin: "0 0 .75rem" }}>Interested in this property?</h4>
            <p style={{ color: "#94a3b8", fontSize: ".85rem", margin: "0 0 1rem" }}>Submit an offer or contact the seller directly.</p>
            <Link href={`/deal-room?property=${property.id}`}>
              <button style={{ width: "100%", marginBottom: ".5rem" }}>Make an Offer</button>
            </Link>
            <Link href="/messages">
              <button className="ghost" style={{ width: "100%" }}>Message Seller</button>
            </Link>
          </div>

          {/* Offers count */}
          {property.offers.length > 0 && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b" }}>{property.offers.length}</span>
                <span style={{ color: "#94a3b8", fontSize: ".9rem" }}>Active offer{property.offers.length !== 1 ? "s" : ""} on this property</span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: ".8rem", margin: ".5rem 0 0" }}>Move fast — this property is attracting interest.</p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
