import { db } from "@/lib/db";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await requireRole(["SELLER", "ADMIN"]);
  
  if (!auth.ok || !auth.user) {
    redirect("/login");
  }

  const userId = auth.user.id;

  // Get user's listings
  const [activeListings, pendingListings, archivedListings] = await Promise.all([
    db.property.findMany({
      where: { sellerId: userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    db.property.findMany({
      where: { sellerId: userId, status: "PENDING_REVIEW" },
      orderBy: { createdAt: "desc" },
    }),
    db.property.findMany({
      where: { sellerId: userId, status: "ARCHIVED" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Get unread message count
  const unreadMessages = await db.message.count({
    where: {
      conversation: {
        participants: {
          some: { userId },
        },
      },
      senderId: { not: userId },
    },
  });

  // Get unread notifications
  const unreadNotifications = await db.notification.count({
    where: { userId, readAt: null },
  });

  const allListings = [...activeListings, ...pendingListings];

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: "0 0 0.5rem" }}>Seller Dashboard</h1>
        <p style={{ color: "#94a3b8", margin: 0 }}>
          Manage your listings and connect with buyers
        </p>
      </div>

      {/* Stats & Quick Actions */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
        gap: "1rem",
        marginBottom: "2rem" 
      }}>
        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 0.25rem", fontSize: "2rem", color: "#16a34a" }}>
            {activeListings.length}
          </h3>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem" }}>Active Listings</p>
        </div>
        
        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 0.25rem", fontSize: "2rem", color: "#f59e0b" }}>
            {pendingListings.length}
          </h3>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem" }}>Pending Review</p>
        </div>
        
        <Link href="/messages" style={{ textDecoration: "none" }}>
          <div className="card" style={{ textAlign: "center", cursor: "pointer" }}>
            <h3 style={{ margin: "0 0 0.25rem", fontSize: "2rem", color: "#60a5fa" }}>
              {unreadMessages > 0 ? `${unreadMessages} 🔔` : "0"}
            </h3>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem" }}>New Messages</p>
          </div>
        </Link>
        
        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 0.25rem", fontSize: "2rem", color: unreadNotifications > 0 ? "#ef4444" : "#94a3b8" }}>
            {unreadNotifications > 0 ? `${unreadNotifications} 🔴` : "0"}
          </h3>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem" }}>Notifications</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/submit">
            <button style={{ width: "auto" }}>+ Create New Listing</button>
          </Link>
          <Link href="/search">
            <button className="ghost" style={{ width: "auto" }}>Browse Properties</button>
          </Link>
          <Link href="/messages">
            <button className="ghost" style={{ width: "auto" }}>
              Messages {unreadMessages > 0 && `(${unreadMessages} new)`}
            </button>
          </Link>
        </div>
      </div>

      {/* Active & Pending Listings */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Your Listings</h2>
          <Link href="/submit" style={{ fontSize: "0.875rem" }}>+ Add New</Link>
        </div>

        {allListings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
            <p style={{ marginBottom: "1rem" }}>You don't have any listings yet.</p>
            <Link href="/submit">
              <button>Create Your First Listing</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {allListings.map((listing) => (
              <div 
                key={listing.id} 
                style={{ 
                  display: "flex", 
                  gap: "1rem", 
                  padding: "1rem", 
                  background: "#111827",
                  borderRadius: "8px",
                  alignItems: "center"
                }}
              >
                {/* Thumbnail */}
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  background: "#1f2937",
                  borderRadius: "6px",
                  backgroundImage: listing.coverImage ? `url(${listing.coverImage})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  flexShrink: 0
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {listing.title}
                    </h3>
                    <span style={{ 
                      fontSize: "0.7rem", 
                      padding: "2px 8px", 
                      borderRadius: "999px",
                      background: listing.status === "ACTIVE" ? "#16a34a" : "#f59e0b",
                      color: "white",
                      fontWeight: 600
                    }}>
                      {listing.status === "PENDING_REVIEW" ? "PENDING" : listing.status}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 0.25rem", color: "#94a3b8", fontSize: "0.875rem" }}>
                    {listing.city ? `${listing.city}, ` : ""}{listing.state} • {listing.lotSizeAcres || "?"} acres
                  </p>
                  <p style={{ margin: 0, color: "#60a5fa", fontWeight: 600 }}>
                    ${listing.askingPrice.toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link href={`/property/${listing.id}`}>
                    <button className="ghost" style={{ width: "auto", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                      View
                    </button>
                  </Link>
                  {listing.status === "ACTIVE" && (
                    <Link href={`/messages?property=${listing.id}`}>
                      <button style={{ width: "auto", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                        Messages
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      {unreadNotifications > 0 && (
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Recent Notifications</h2>
          <p style={{ color: "#94a3b8" }}>
            You have {unreadNotifications} unread notification{unreadNotifications !== 1 ? "s" : ""}.
            Check your notification bell above.
          </p>
        </div>
      )}
    </section>
  );
}
