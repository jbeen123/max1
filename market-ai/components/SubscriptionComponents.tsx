"use client";

import Link from "next/link";

interface PaywallModalProps {
  feature: string;
  description?: string;
  onClose?: () => void;
}

export function PaywallModal({ feature, description, onClose }: PaywallModalProps) {
  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem"
      }}
      onClick={onClose}
    >
      <div 
        className="card"
        style={{
          maxWidth: 450,
          width: "100%",
          textAlign: "center",
          padding: "2rem"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        
        <h2 style={{ marginBottom: "0.5rem" }}>Pro Feature</h2>
        
        <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
          {description || `${feature} is available with a Pro subscription.`}
        </p>
        
        <div style={{ 
          background: "#1e3a5f", 
          padding: "1rem", 
          borderRadius: "8px",
          marginBottom: "1.5rem"
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#c4b5fd" }}>
            $399
            <span style={{ fontSize: "0.875rem", color: "#94a3b8" }}>/month</span>
          </div>
          <div style={{ fontSize: "0.875rem", color: "#16a34a" }}>
            🎉 3-Day Free Trial
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link href="/pricing">
            <button style={{ width: "100%" }}>
              Upgrade to Pro →
            </button>
          </Link>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="ghost"
              style={{ width: "100%" }}
            >
              Maybe Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <div style={{
      background: "linear-gradient(90deg, #7c3aed, #a855f7)",
      color: "white",
      padding: "0.75rem 1rem",
      textAlign: "center",
      fontSize: "0.875rem"
    }}>
      🎉 <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""} left</strong> in your free trial. 
      <Link href="/pricing" style={{ color: "white", textDecoration: "underline" }}>
        View plan details →
      </Link>
    </div>
  );
}

export function SubscriptionBadge({ status }: { status: "pro" | "trial" | "free" }) {
  const styles = {
    pro: { background: "#7c3aed", color: "white" },
    trial: { background: "#f59e0b", color: "white" },
    free: { background: "#374151", color: "#94a3b8" }
  };

  const labels = {
    pro: "PRO",
    trial: "TRIAL",
    free: "FREE"
  };

  return (
    <span style={{
      ...styles[status],
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "0.625rem",
      fontWeight: 700,
      letterSpacing: "0.05em"
    }}>
      {labels[status]}
    </span>
  );
}
