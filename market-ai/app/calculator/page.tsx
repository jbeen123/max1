"use client";

import { useState } from "react";
import Link from "next/link";
import { PaywallModal } from "@/components/SubscriptionComponents";

interface CalculationResult {
  profit: number;
  roi: number;
  totalCosts: number;
  saleProceeds: number;
  monthlyHoldingCost: number;
  breakEvenMonths: number;
}

export default function ProfitCalculatorPage() {
  const [inputs, setInputs] = useState({
    purchasePrice: "",
    salePrice: "",
    acres: "",
    holdingMonths: "6",
    assignmentFee: "",
    closingCostsBuyer: "5000",
    closingCostsSeller: "5000",
    renovationCosts: "",
    propertyTaxes: "",
    insurance: "",
    utilities: "",
    marketingCosts: "",
    otherCosts: "",
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculate = () => {
    const purchase = parseFloat(inputs.purchasePrice) || 0;
    const sale = parseFloat(inputs.salePrice) || 0;
    const acres = parseFloat(inputs.acres) || 1;
    const holding = parseInt(inputs.holdingMonths) || 0;
    const assignment = parseFloat(inputs.assignmentFee) || 0;
    
    const closingBuyer = parseFloat(inputs.closingCostsBuyer) || 0;
    const closingSeller = parseFloat(inputs.closingCostsSeller) || 0;
    const renovation = parseFloat(inputs.renovationCosts) || 0;
    
    const taxes = (parseFloat(inputs.propertyTaxes) || 0) * holding / 12;
    const insurance = (parseFloat(inputs.insurance) || 0) * holding / 12;
    const utilities = (parseFloat(inputs.utilities) || 0) * holding;
    const marketing = parseFloat(inputs.marketingCosts) || 0;
    const other = parseFloat(inputs.otherCosts) || 0;

    // Calculate totals
    const totalCosts = purchase + closingBuyer + closingSeller + renovation + taxes + insurance + utilities + marketing + other;
    const saleProceeds = sale - closingSeller - assignment;
    const profit = saleProceeds - totalCosts + assignment;
    const roi = purchase > 0 ? (profit / purchase) * 100 : 0;
    const monthlyHoldingCost = (taxes + insurance + utilities) / Math.max(1, holding);
    const breakEvenMonths = monthlyHoldingCost > 0 ? profit / monthlyHoldingCost : 0;

    setResult({
      profit,
      roi,
      totalCosts,
      saleProceeds,
      monthlyHoldingCost,
      breakEvenMonths,
    });
  };

  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Land Deal Profit Calculator
        </h1>
        <p style={{ color: "#94a3b8" }}>
          Analyze your land investment deals and calculate potential returns
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
        {/* Input Section */}
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Deal Details</h2>
          
          {/* Basic Info */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.75rem", textTransform: "uppercase" }}>
              Property Info
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Purchase Price *
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={inputs.purchasePrice}
                  onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Expected Sale Price *
                </label>
                <input
                  type="number"
                  placeholder="75000"
                  value={inputs.salePrice}
                  onChange={(e) => handleInputChange("salePrice", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Acres
                </label>
                <input
                  type="number"
                  placeholder="5"
                  value={inputs.acres}
                  onChange={(e) => handleInputChange("acres", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Holding Period (months)
                </label>
                <input
                  type="number"
                  placeholder="6"
                  value={inputs.holdingMonths}
                  onChange={(e) => handleInputChange("holdingMonths", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* Costs */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.75rem", textTransform: "uppercase" }}>
              Acquisition Costs
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Buyer Closing Costs
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  value={inputs.closingCostsBuyer}
                  onChange={(e) => handleInputChange("closingCostsBuyer", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Renovation/Clearing
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={inputs.renovationCosts}
                  onChange={(e) => handleInputChange("renovationCosts", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* Holding Costs */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.75rem", textTransform: "uppercase" }}>
              Monthly Holding Costs
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Property Taxes (annual)
                </label>
                <input
                  type="number"
                  placeholder="1200"
                  value={inputs.propertyTaxes}
                  onChange={(e) => handleInputChange("propertyTaxes", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Insurance (annual)
                </label>
                <input
                  type="number"
                  placeholder="600"
                  value={inputs.insurance}
                  onChange={(e) => handleInputChange("insurance", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Utilities (monthly)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={inputs.utilities}
                  onChange={(e) => handleInputChange("utilities", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Other Costs
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={inputs.otherCosts}
                  onChange={(e) => handleInputChange("otherCosts", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* Sale Costs */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.75rem", textTransform: "uppercase" }}>
              Sale Costs
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Seller Closing Costs
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  value={inputs.closingCostsSeller}
                  onChange={(e) => handleInputChange("closingCostsSeller", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Marketing/Advertising
                </label>
                <input
                  type="number"
                  placeholder="500"
                  value={inputs.marketingCosts}
                  onChange={(e) => handleInputChange("marketingCosts", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.75rem", textTransform: "uppercase" }}>
              Wholesale (Optional)
            </h3>
            
            <div>
              <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                Assignment Fee
              </label>
              <input
                type="number"
                placeholder="5000"
                value={inputs.assignmentFee}
                onChange={(e) => handleInputChange("assignmentFee", e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <button 
            onClick={calculate}
            style={{ width: "100%", marginTop: "1rem" }}
          >
            Calculate Profit
          </button>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <>
              {/* Main Results */}
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Analysis Results</h2>
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "1rem",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{ 
                    background: result.profit >= 0 ? "#16a34a20" : "#dc262620",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                      Net Profit
                    </div>
                    <div style={{ 
                      fontSize: "2rem", 
                      fontWeight: 700,
                      color: result.profit >= 0 ? "#16a34a" : "#dc2626"
                    }}>
                      {formatCurrency(result.profit)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: "#7c3aed20",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                      Return on Investment (ROI)
                    </div>
                    <div style={{ 
                      fontSize: "2rem", 
                      fontWeight: 700,
                      color: "#c4b5fd"
                    }}>
                      {formatPercent(result.roi)}
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div style={{ marginTop: "1.5rem" }}>
                  <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Cost Breakdown</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #1f2937" }}>
                      <span style={{ color: "#94a3b8" }}>Total Investment</span>
                      <span>{formatCurrency(result.totalCosts)}</span>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #1f2937" }}>
                      <span style={{ color: "#94a3b8" }}>Expected Sale Proceeds</span>
                      <span>{formatCurrency(result.saleProceeds)}</span>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #1f2937" }}>
                      <span style={{ color: "#94a3b8" }}>Monthly Holding Cost</span>
                      <span>{formatCurrency(result.monthlyHoldingCost)}</span>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem" }}>
                      <span style={{ color: "#94a3b8" }}>Break-even Timeline</span>
                      <span>{result.breakEvenMonths.toFixed(1)} months</span>
                    </div>
                  </div>
                </div>

                {/* Per Acre Analysis */}
                {parseFloat(inputs.acres) > 0 && (
                  <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #374151" }}>
                    <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Per Acre Analysis</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94a3b8" }}>Purchase Price / Acre</span>
                        <span>{formatCurrency(parseFloat(inputs.purchasePrice || "0") / parseFloat(inputs.acres))}</span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94a3b8" }}>Sale Price / Acre</span>
                        <span>{formatCurrency(parseFloat(inputs.salePrice || "0") / parseFloat(inputs.acres))}</span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94a3b8" }}>Profit / Acre</span>
                        <span style={{ color: result.profit >= 0 ? "#16a34a" : "#dc2626" }}>
                          {formatCurrency(result.profit / parseFloat(inputs.acres))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                <div className="card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.25rem" }}>
                    Total Costs
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                    {formatCurrency(result.totalCosts)}
                  </div>
                </div>
                
                <div className="card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.25rem" }}>
                    Gross Profit Margin
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#c4b5fd" }}>
                    {formatPercent((result.profit / (parseFloat(inputs.salePrice || "1"))) * 100)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <button 
                  className="ghost"
                  style={{ flex: 1 }}
                  onClick={() => {
                    // Copy results to clipboard
                    const text = `Deal Analysis:
Purchase: ${formatCurrency(parseFloat(inputs.purchasePrice || "0"))}
Sale: ${formatCurrency(parseFloat(inputs.salePrice || "0"))}
Profit: ${formatCurrency(result.profit)}
ROI: ${formatPercent(result.roi)}`;
                    navigator.clipboard.writeText(text);
                    alert("Copied to clipboard!");
                  }}
                >
                  📋 Copy Results
                </button>
                
                <Link href="/pricing" style={{ flex: 1 }}>
                  <button style={{ width: "100%" }}>
                    💾 Save (Pro)
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧮</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Enter Your Deal Details</h3>
              <p style={{ color: "#94a3b8" }}>
                Fill in the purchase price, expected sale price, and costs to see your profit analysis.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Deal Analysis Guidelines</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", color: "#16a34a" }}>✓ Good Deal</h3>
            <ul style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, paddingLeft: "1.25rem" }}>
              <li>ROI &gt; 20%</li>
              <li>Profit margin &gt; 15%</li>
              <li>Holding period &lt; 12 months</li>
              <li>Clear title and access</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", color: "#f59e0b" }}>⚠️ Consider Carefully</h3>
            <ul style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, paddingLeft: "1.25rem" }}>
              <li>ROI 10-20%</li>
              <li>Extended holding period</li>
              <li>High renovation costs</li>
              <li>Zoning uncertainties</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", color: "#dc2626" }}>✗ Avoid</h3>
            <ul style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, paddingLeft: "1.25rem" }}>
              <li>ROI &lt; 10%</li>
              <li>Negative cash flow</li>
              <li>Title issues</li>
              <li>No clear exit strategy</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
