import { db } from "@/lib/db";

export default async function DashboardPage() {
  const [users, listings, offers, pending, active] = await Promise.all([
    db.user.count(),
    db.property.count(),
    db.offer.count(),
    db.property.count({ where: { status: "PENDING_REVIEW" } }),
    db.property.count({ where: { status: "ACTIVE" } }),
  ]);

  const queue = await db.property.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { createdAt: "asc" },
    include: { seller: { select: { email: true } } },
    take: 10,
  });

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <div className="grid grid-3">
        <div className="card"><h3>Users</h3><p>{users}</p></div>
        <div className="card"><h3>Total Listings</h3><p>{listings}</p></div>
        <div className="card"><h3>Offers</h3><p>{offers}</p></div>
        <div className="card"><h3>Pending Review</h3><p>{pending}</p></div>
        <div className="card"><h3>Active Listings</h3><p>{active}</p></div>
      </div>

      <div className="card">
        <h3>Moderation Queue</h3>
        {queue.length === 0 ? <p>No pending listings.</p> : (
          <ul>
            {queue.map((q) => (
              <li key={q.id}>{q.title} — {q.county}, {q.state} (${q.askingPrice.toLocaleString()}) · seller {q.seller.email}</li>
            ))}
          </ul>
        )}
        <p style={{ color: "#94a3b8" }}>Use API: POST /api/moderation with action APPROVE or REJECT.</p>
      </div>
    </section>
  );
}
