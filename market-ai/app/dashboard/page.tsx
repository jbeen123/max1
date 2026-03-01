import { db } from "@/lib/db";
import { ModerationQueue } from "@/components/ModerationQueue";
import { KycPanel } from "@/components/KycPanel";
import { IntegrationsPanel } from "@/components/IntegrationsPanel";

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

      <ModerationQueue initialQueue={queue} />
      <KycPanel />
      <IntegrationsPanel />
    </section>
  );
}
