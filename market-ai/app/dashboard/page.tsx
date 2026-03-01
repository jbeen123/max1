import { db } from "@/lib/db";

export default async function DashboardPage() {
  const [users, listings, offers] = await Promise.all([
    db.user.count(),
    db.property.count(),
    db.offer.count(),
  ]);

  return (
    <section className="grid grid-2">
      <div className="card"><h3>Users</h3><p>{users}</p></div>
      <div className="card"><h3>Listings</h3><p>{listings}</p></div>
      <div className="card"><h3>Offers</h3><p>{offers}</p></div>
      <div className="card"><h3>Moderation Queue</h3><p>Wire to status = PENDING_REVIEW.</p></div>
    </section>
  );
}
