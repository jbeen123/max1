"use client";

import { useEffect, useState } from "react";

interface MatchFactor {
  name: string;
  score: number;
  weight: number;
  reason: string;
}

interface Match {
  propertyId: string;
  buyerId: string;
  score: number;
  tier: "A" | "B" | "C" | "D";
  factors: MatchFactor[];
  property: {
    id: string;
    title: string;
    state: string;
    county: string;
    askingPrice: number;
    zoning: string | null;
    lotSizeAcres: number | null;
  } | null;
  buyer: {
    id: string;
    name: string | null;
    email: string;
    state: string | null;
  } | null;
}

const TIER_COLORS: Record<string, string> = {
  A: "#22c55e",
  B: "#3b82f6",
  C: "#f59e0b",
  D: "#ef4444",
};

const TIER_LABELS: Record<string, string> = {
  A: "A – Strong Match",
  B: "B – Good Match",
  C: "C – Possible Match",
  D: "D – Weak Match",
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(30);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadMatches() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches?minScore=${minScore}&limit=50`);
      if (res.status === 401) {
        setError("Please log in to view your matches.");
        return;
      }
      const data = await res.json();
      setMatches(Array.isArray(data.matches) ? data.matches : []);
    } catch {
      setError("Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="grid" style={{ gap: "1.25rem" }}>
      {/* Header */}
      <div className="card hero">
        <p className="eyebrow">AI Engine</p>
        <h1 style={{ margin: ".25rem 0 .5rem", fontSize: "1.6rem" }}>
          AI-Matched Deals
        </h1>
        <p className="lead">
          Our matching engine scores every active listing against verified buyers
          using location, price fit, zoning, lot size, and seller motivation signals.
        </p>
      </div>

      {/* Controls */}
      <div className="card">
        <div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: ".35rem", color: "#94a3b8", fontSize: ".85rem" }}>
              Minimum Match Score: {minScore}
            </label>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              style={{ width: "100%", padding: 0, background: "transparent", border: "none" }}
            />
          </div>
          <button
            onClick={loadMatches}
            style={{ width: "auto", padding: ".65rem 1.25rem" }}
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh Matches"}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="card" style={{ borderColor: "#ef4444", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-3">
          {(["A", "B", "C", "D"] as const).map((tier) => {
            const count = matches.filter((m) => m.tier === tier).length;
            return (
              <div key={tier} className="card" style={{ borderColor: TIER_COLORS[tier] + "44" }}>
                <div style={{ fontSize: ".8rem", color: "#94a3b8", marginBottom: ".25rem" }}>
                  {TIER_LABELS[tier]}
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: TIER_COLORS[tier] }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Match cards */}
      {!loading && !error && matches.length === 0 && (
        <div className="card">
          <p style={{ color: "#94a3b8" }}>
            No matches found with a score ≥ {minScore}. Try lowering the minimum score or
            ensure there are active listings and verified buyers.
          </p>
        </div>
      )}

      {matches.map((m) => {
        const key = `${m.propertyId}-${m.buyerId}`;
        const isExpanded = expandedId === key;
        return (
          <div
            key={key}
            className="card"
            style={{ borderColor: TIER_COLORS[m.tier] + "55" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: ".5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".4rem" }}>
                  <span style={{
                    background: TIER_COLORS[m.tier] + "22",
                    border: `1px solid ${TIER_COLORS[m.tier]}55`,
                    color: TIER_COLORS[m.tier],
                    borderRadius: "6px",
                    padding: ".15rem .5rem",
                    fontSize: ".75rem",
                    fontWeight: 600,
                  }}>
                    Tier {m.tier}
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0" }}>
                    {m.score}/100
                  </span>
                </div>
                <div style={{ fontSize: ".95rem", color: "#cbd5e1" }}>
                  <strong style={{ color: "#e2e8f0" }}>
                    {m.property?.title ?? m.propertyId}
                  </strong>
                  {m.property && (
                    <span style={{ color: "#94a3b8" }}>
                      {" "}· {m.property.county}, {m.property.state} ·{" "}
                      ${m.property.askingPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: ".85rem", color: "#94a3b8", marginTop: ".25rem" }}>
                  Buyer: {m.buyer?.name ?? m.buyer?.email ?? m.buyerId}
                  {m.buyer?.state && ` · ${m.buyer.state}`}
                </div>
              </div>

              {/* Score bar */}
              <div style={{ minWidth: "120px" }}>
                <div style={{
                  height: "8px",
                  background: "#1e293b",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${m.score}%`,
                    background: TIER_COLORS[m.tier],
                    borderRadius: "4px",
                    transition: "width .3s",
                  }} />
                </div>
                <div style={{ fontSize: ".7rem", color: "#64748b", marginTop: ".2rem", textAlign: "right" }}>
                  {m.score}% match
                </div>
              </div>
            </div>

            {/* Factor breakdown toggle */}
            <button
              className="ghost"
              onClick={() => setExpandedId(isExpanded ? null : key)}
              style={{ marginTop: ".75rem", width: "auto", padding: ".35rem .75rem", fontSize: ".8rem" }}
            >
              {isExpanded ? "▲ Hide factors" : "▼ Show factors"}
            </button>

            {isExpanded && (
              <div style={{ marginTop: ".75rem", display: "grid", gap: ".5rem" }}>
                {m.factors.map((f) => (
                  <div key={f.name} style={{
                    background: "#0f1728",
                    borderRadius: "8px",
                    padding: ".5rem .75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: ".5rem",
                    flexWrap: "wrap",
                  }}>
                    <div>
                      <span style={{ fontSize: ".8rem", fontWeight: 600, color: "#93c5fd", textTransform: "uppercase", letterSpacing: ".5px" }}>
                        {f.name.replace(/_/g, " ")}
                      </span>
                      <p style={{ margin: ".2rem 0 0", fontSize: ".82rem", color: "#94a3b8" }}>{f.reason}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#e2e8f0" }}>
                        {Math.round(f.score * 100)}%
                      </div>
                      <div style={{ fontSize: ".7rem", color: "#64748b" }}>
                        weight {Math.round(f.weight * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {loading && (
        <div className="card" style={{ textAlign: "center", color: "#94a3b8" }}>
          Calculating matches…
        </div>
      )}
    </section>
  );
}
