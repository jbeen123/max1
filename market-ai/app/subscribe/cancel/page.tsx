import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SubscribeCancelPage() {
  return (
    <section style={{ maxWidth: 600, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😕</div>
      
      <h1 style={{ marginBottom: "1rem" }}>Checkout Canceled</h1>
      
      <p style={{ color: "#94a3b8", marginBottom: "2rem", fontSize: "1.125rem" }}>
        No worries! You can continue using the free tier or try again whenever you're ready.
      </p>
      
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/pricing">
          <button>Try Again →</button>
        </Link>
        
        <Link href="/search">
          <button className="ghost">Browse Listings</button>
        </Link>
      </div>
    </section>
  );
}
