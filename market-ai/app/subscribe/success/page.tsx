import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SubscribeSuccessPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ session_id?: string }> 
}) {
  const params = await searchParams;
  return (
    <section style={{ maxWidth: 600, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
      
      <h1 style={{ marginBottom: "1rem" }}>Welcome to Market-AI Pro!</h1>
      
      <p style={{ color: "#94a3b8", marginBottom: "2rem", fontSize: "1.125rem" }}>
        Your subscription is now active. You have <strong>3 days free</strong> to try all Pro features.
      </p>
      
      <div className="card" style={{ marginBottom: "2rem", textAlign: "left" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>What's included:</h3>
        <ul style={{ color: "#94a3b8", lineHeight: 1.8 }}>
          <li>✅ Unlimited property listings</li>
          <li>✅ Direct messaging with buyers/sellers</li>
          <li>✅ Priority listing approval (24 hours)</li>
          <li>✅ Verified Pro badge on your profile</li>
          <li>✅ Lead analytics and export tools</li>
        </ul>
      </div>
      
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/dashboard">
          <button>Go to Dashboard →</button>
        </Link>
        
        <Link href="/submit">
          <button className="ghost">Create Your First Listing</button>
        </Link>
      </div>
      
      <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#6b7280" }}>
        Questions? Contact us at <a href="mailto:support@marketai.com">support@marketai.com</a>
      </p>
    </section>
  );
}
