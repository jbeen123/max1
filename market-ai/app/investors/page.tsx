import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function InvestorsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const state = sp.state || "";
  const q = sp.q || "";

  const buyers = await db.user.findMany({
    where: {
      role: "BUYER",
      isVerified: true,
      ...(state ? { state } : {}),
      ...(q ? { OR: [
        { name: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
      ]} : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const states = ["TX", "FL", "GA", "NC", "AZ", "TN", "SC", "AL", "CO", "NV"];
  const total = await db.user.count({ where: { role: "BUYER", isVerified: true } });

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 .25rem" }}>Buyers, Investors &amp; Builders</h2>
        <p style={{ color: "#94a3b8", margin: 0 }}>{total} verified buyers registered on market.ai</p>
      </div>

      {/* Filters */}
      <form method="GET" style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <input name="q" placeholder="Search by name, company, or specialty…" defaultValue={q} style={{ flex: 2, minWidth: 200 }} />
        <select name="state" defaultValue={state} style={{ flex: 1, minWidth: 120 }}>
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" style={{ width: "auto", padding: ".6rem 1.5rem" }}>Search</button>
        <a href="/investors"><button type="button" className="ghost" style={{ width: "auto", padding: ".6rem 1rem" }}>Clear</button></a>
      </form>

      {/* Cards */}
      {buyers.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          <p>No verified buyers match your search.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {buyers.map((b) => (
            <div key={b.id} className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-start", marginBottom: ".75rem" }}>
                {b.avatarUrl ? (
                  <img src={b.avatarUrl} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                    {b.name?.[0] ?? "?"}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: ".95rem" }}>
                    {b.name}
                    <span style={{ color: "#16a34a", marginLeft: ".4rem", fontSize: ".8rem" }}>✓ Verified</span>
                  </div>
                  {b.company && <div style={{ color: "#94a3b8", fontSize: ".8rem", marginTop: ".1rem" }}>{b.company}</div>}
                  {b.state && (
                    <span style={{ background: "#1e3a5f", color: "#93c5fd", padding: "1px 8px", borderRadius: 999, fontSize: ".7rem", marginTop: ".3rem", display: "inline-block" }}>
                      📍 {b.state}
                    </span>
                  )}
                </div>
              </div>

              {b.bio && (
                <p style={{ color: "#94a3b8", fontSize: ".82rem", lineHeight: 1.55, margin: "0 0 .75rem" }}>
                  {b.bio.slice(0, 140)}…
                </p>
              )}

              <div style={{ borderTop: "1px solid #1f2937", paddingTop: ".75rem", display: "flex", flexDirection: "column", gap: ".35rem" }}>
                {b.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".82rem" }}>
                    <span>📞</span>
                    <a href={`tel:${b.phone}`} style={{ color: "#60a5fa", textDecoration: "none" }}>{b.phone}</a>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".82rem" }}>
                  <span>✉️</span>
                  <a href={`mailto:${b.email}`} style={{ color: "#60a5fa", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.email}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
