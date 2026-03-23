import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [users, listings, pending, active] = await Promise.all([
    db.user.count(),
    db.property.count(),
    db.property.count({ where: { status: "PENDING_REVIEW" } }),
    db.property.count({ where: { status: "ACTIVE" } }),
  ]);

  const pendingListings = await db.property.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { createdAt: "asc" },
    include: { seller: { select: { email: true, name: true } } },
    take: 20,
  });

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Admin Dashboard</h1>

      {/* Stats Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1rem",
        marginBottom: "2rem" 
      }}>
        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "2rem", color: "#60a5fa" }}>{users}</h3>
          <p style={{ margin: 0, color: "#94a3b8" }}>Total Users</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "2rem", color: "#60a5fa" }}>{listings}</h3>
          <p style={{ margin: 0, color: "#94a3b8" }}>Total Listings</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "2rem", color: "#f59e0b" }}>{pending}</h3>
          <p style={{ margin: 0, color: "#94a3b8" }}>Pending Review</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "2rem", color: "#16a34a" }}>{active}</h3>
          <p style={{ margin: 0, color: "#94a3b8" }}>Active Listings</p>
        </div>
      </div>

      {/* Pending Listings Queue */}
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>
          Pending Approval {pending > 0 && <span style={{ color: "#f59e0b" }}>({pending})</span>}
        </h2>
        
        {pendingListings.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
            No listings pending review.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #374151" }}>
                  <th style={{ textAlign: "left", padding: "0.75rem" }}>Property</th>
                  <th style={{ textAlign: "left", padding: "0.75rem" }}>Seller</th>
                  <th style={{ textAlign: "right", padding: "0.75rem" }}>Price</th>
                  <th style={{ textAlign: "left", padding: "0.75rem" }}>Location</th>
                  <th style={{ textAlign: "left", padding: "0.75rem" }}>Submitted</th>
                  <th style={{ textAlign: "center", padding: "0.75rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingListings.map((listing) => (
                  <tr key={listing.id} style={{ borderBottom: "1px solid #1f2937" }}>
                    <td style={{ padding: "0.75rem" }}>
                      <Link href={`/property/${listing.id}`} style={{ color: "#60a5fa", textDecoration: "none" }}>
                        {listing.title.slice(0, 40)}{listing.title.length > 40 ? "..." : ""}
                      </Link>
                    </td>
                    <td style={{ padding: "0.75rem", color: "#94a3b8" }}>
                      {listing.seller.name || listing.seller.email}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 600 }}>
                      ${listing.askingPrice.toLocaleString()}
                    </td>
                    <td style={{ padding: "0.75rem", color: "#94a3b8" }}>
                      {listing.county ? `${listing.county}, ` : ""}{listing.state}
                    </td>
                    <td style={{ padding: "0.75rem", color: "#94a3b8" }}>
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <form action={`/api/admin/approve?id=${listing.id}`} method="POST">
                          <button type="submit" style={{ 
                            background: "#16a34a", 
                            color: "white", 
                            border: "none",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                          }}>
                            Approve
                          </button>
                        </form>
                        <form action={`/api/admin/reject?id=${listing.id}`} method="POST">
                          <button type="submit" style={{ 
                            background: "#dc2626", 
                            color: "white", 
                            border: "none",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                          }}>
                            Reject
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/search">
            <button style={{ width: "auto" }}>View Public Listings</button>
          </Link>
          <Link href="/submit">
            <button className="ghost" style={{ width: "auto" }}>Create Test Listing</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
