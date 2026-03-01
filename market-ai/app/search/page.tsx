import { db } from "@/lib/db";
import { ComplianceBadge } from "@/components/ComplianceBadge";

export default async function SearchPage() {
  const properties = await db.property.findMany({ orderBy: { createdAt: "desc" }, take: 20 });

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <h2>Search Listings</h2>
      {properties.length === 0 && <p>No listings yet. Add one from Submit.</p>}
      {properties.map((p) => (
        <article key={p.id} className="card">
          <h3 style={{ marginTop: 0 }}>{p.title}</h3>
          <p>{p.description}</p>
          <p>
            {p.county}, {p.state} · ${p.askingPrice.toLocaleString()}
          </p>
          <ComplianceBadge state={p.state} assignmentAllowed={p.assignmentAllowed} />
        </article>
      ))}
    </section>
  );
}
