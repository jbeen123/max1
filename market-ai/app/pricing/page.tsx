import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getUserSubscription, formatPrice, SUBSCRIPTION_PRICE } from "@/lib/subscription";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const auth = await requireRole(["BUYER", "SELLER", "ADMIN"]);
  
  let subscription = null;
  if (auth.ok && auth.user) {
    subscription = await getUserSubscription(auth.user.id);
  }

  const isPro = subscription?.isPro ?? false;
  const trialDaysLeft = subscription?.trialDaysLeft;

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          Unlock Full Access to Market-AI
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.125rem", maxWidth: 600, margin: "0 auto" }}>
          Connect with serious land buyers and sellers. Get priority access to deals, 
          direct messaging, and unlimited listings.
        </p>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "2rem",
        maxWidth: 900,
        margin: "0 auto"
      }}>
        {/* Free Tier */}
        <div className="card" style={{ 
          padding: "2rem",
          border: "2px solid #374151",
          position: "relative"
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Free</h2>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
            $0
            <span style={{ fontSize: "1rem", color: "#94a3b8", fontWeight: 400 }}>/month</span>
          </div>
          
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", color: "#94a3b8" }}>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#16a34a" }}>✓</span> Browse all listings
            </li>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#16a34a" }}>✓</span> Create 1 listing
            </li>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}>
              <span>✗</span> No messaging
            </li>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}>
              <span>✗</span> Standard approval time
            </li>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}>
              <span>✗</span> No analytics
            </li>
          </ul>

          {isPro ? (
            <button disabled className="ghost" style={{ width: "100%", opacity: 0.5 }}>
              Current Plan
            </button>
          ) : (
            <Link href="/search">
              <button className="ghost" style={{ width: "100%" }}>
                Continue Free
              </button>
            </Link>
          )}
        </div>

        {/* Pro Tier */}
        <div className="card" style={{ 
          padding: "2rem",
          border: "2px solid #7c3aed",
          position: "relative",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
        }}>
          <div style={{
            position: "absolute",
            top: -12,
            right: 20,
            background: "#7c3aed",
            color: "white",
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 600
          }}>
            MOST POPULAR
          </div>

          <h2 style={{ marginTop: 0, marginBottom: "0.5rem", color: "#c4b5fd" }}>Pro</h2>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "#c4b5fd" }}>
            {formatPrice(SUBSCRIPTION_PRICE)}
            <span style={{ fontSize: "1rem", color: "#94a3b8", fontWeight: 400 }}>/month</span>
          </div>
          
          <div style={{ 
            background: "#16a34a", 
            color: "white", 
            padding: "4px 12px", 
            borderRadius: "6px",
            fontSize: "0.875rem",
            display: "inline-block",
            marginBottom: "1.5rem"
          }}>
            🎉 3-Day Free Trial
          </div>
          
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem" }}>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#16a34a" }}>✓</span> <strong>Unlimited listings</strong>
            </li>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#16a34a" }}>✓</span> <strong>Direct messaging</strong>
            </li>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#16a34a" }}>✓</span> Priority approval (24h)
            </li>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#16a34a" }}>✓</span> Verified Pro badge
            </li>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#16a34a" }}>✓</span> Lead analytics & exports
            </li>
            <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#16a34a" }}>✓</span> Cancel anytime
            </li>
          </ul>

          {isPro ? (
            <div>
              <button disabled style={{ width: "100%", opacity: 0.5, marginBottom: "0.5rem" }}>
                ✓ Active Subscription
              </button>
              {trialDaysLeft != null && trialDaysLeft > 0 && (
                <div style={{ textAlign: "center", color: "#f59e0b", fontSize: "0.875rem" }}>
                  {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in trial
                </div>
              )}
            </div>
          ) : (
            <form action="/api/subscription/checkout" method="POST">
              <input type="hidden" name="priceId" value={process.env.STRIPE_PRICE_ID} />
              <button type="submit" style={{ width: "100%", background: "#7c3aed" }}>
                Start Free Trial →
              </button>
              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.75rem", marginBottom: 0 }}>
                No credit card required for trial
              </p>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ maxWidth: 700, margin: "4rem auto 0" }}>
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Frequently Asked Questions</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1rem" }}>
              What happens after the 3-day trial?
            </h3>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>
              After your trial ends, you'll be automatically charged $399/month. 
              You can cancel anytime during the trial and won't be charged.
            </p>
          </div>
          
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1rem" }}>
              Can I cancel my subscription?
            </h3>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>
              Yes, you can cancel anytime from your account settings. You'll continue 
              to have access until the end of your billing period.
            </p>
          </div>
          
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1rem" }}>
              What if I only need to list one property?
            </h3>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>
              The free tier lets you create one listing. However, you won't be able 
              to message buyers directly. Upgrade to Pro for full messaging access.
            </p>
          </div>
          
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1rem" }}>
              Is there a refund policy?
            </h3>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>
              We offer a 3-day free trial so you can evaluate the service. 
              If you're not satisfied, cancel during the trial and pay nothing. 
              After billing, we don't offer refunds but you can cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
