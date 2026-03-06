import { PUBLIC_BUYER_FIELDS, PUBLIC_LAND_FIELDS, PUBLIC_SELLER_FIELDS } from "@/lib/public-info";

export default function PublicInfoPage() {
  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <div className="card">
        <h2>Public Information Directory</h2>
        <p style={{ color: "#94a3b8" }}>
          These are the public-facing info categories for marketplace participants and land listings.
          Sensitive or private identity and payment data should never be published.
        </p>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <h3>Public Seller Info</h3>
          <ul>
            {PUBLIC_SELLER_FIELDS.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>

        <div className="card">
          <h3>Public Buyer Info</h3>
          <ul>
            {PUBLIC_BUYER_FIELDS.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>

        <div className="card">
          <h3>Public Real Estate / Land Info</h3>
          <ul>
            {PUBLIC_LAND_FIELDS.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
