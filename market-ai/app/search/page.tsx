import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import { ComplianceBadge } from "@/components/ComplianceBadge";

export default async function SearchPage() {
  const properties = await db.property.findMany({
    where: { status: { in: ["ACTIVE", "UNDER_CONTRACT", "ASSIGNED"] } },
    include: {
      seller: { select: { name: true, role: true, isVerified: true, state: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <h2>Search Listings</h2>
      {properties.length === 0 && <p>No active listings yet. Approve one from moderation queue.</p>}
      {properties.map((p) => {
        const publicInfo = ((p.disclosures as any)?.publicInfo || {}) as any;
        const sellerPublic = publicInfo?.seller || {};
        const landPublic = publicInfo?.land || {};

        return (
          <article key={p.id} className="card">
            <h3 style={{ marginTop: 0 }}>{p.title}</h3>
            <p>{p.description}</p>
            <p>
              {p.county}, {p.state} · ${p.askingPrice.toLocaleString()} · status {p.status}
            </p>
            <ComplianceBadge state={p.state} assignmentAllowed={p.assignmentAllowed} />

            <div style={{ marginTop: ".75rem" }}>
              <strong>Public seller info</strong>
              <p style={{ margin: ".35rem 0 0" }}>
                {(sellerPublic.displayName || p.seller?.name || "Seller")} · {p.seller?.role || "SELLER"}
                {p.seller?.isVerified ? " · Verified" : ""}
                {(sellerPublic.publicContact ? ` · ${sellerPublic.publicContact}` : "")}
              </p>
            </div>

            <div style={{ marginTop: ".5rem" }}>
              <strong>Public land info</strong>
              <p style={{ margin: ".35rem 0 0" }}>
                {[landPublic.city, landPublic.zipCode].filter(Boolean).join(", ") || "City/ZIP not provided"}
                {p.parcelId ? ` · Parcel ${p.parcelId}` : ""}
                {p.zoning ? ` · Zoning ${p.zoning}` : ""}
                {p.lotSizeAcres ? ` · ${p.lotSizeAcres} acres` : ""}
                {landPublic.annualTaxes ? ` · Taxes $${Number(landPublic.annualTaxes).toLocaleString()}/yr` : ""}
                {landPublic.roadAccess ? ` · Road ${landPublic.roadAccess}` : ""}
                {landPublic.utilities ? ` · Utilities ${landPublic.utilities}` : ""}
                {landPublic.floodZone ? ` · Flood ${landPublic.floodZone}` : ""}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
