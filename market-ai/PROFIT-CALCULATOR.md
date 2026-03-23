# Market-AI Profit Calculator

A built-in tool for land investors to analyze deals and calculate potential returns.

## Features

### Deal Analysis
- **Purchase Price** - What you pay to acquire the property
- **Sale Price** - Expected sale price to end buyer
- **Holding Period** - How long you'll hold the property
- **Property Size** - Acres for per-acre analysis

### Cost Breakdown

#### Acquisition Costs
- Buyer closing costs
- Renovation/clearing costs

#### Holding Costs (Monthly)
- Property taxes (annual)
- Insurance (annual)
- Utilities (monthly)
- Other costs

#### Sale Costs
- Seller closing costs
- Marketing/advertising

#### Wholesale Option
- Assignment fee (for wholesale deals)

### Calculated Metrics

| Metric | Description |
|--------|-------------|
| **Net Profit** | Total profit after all costs |
| **ROI** | Return on Investment percentage |
| **Total Investment** | All-in cost including holding |
| **Sale Proceeds** | Net from sale after costs |
| **Monthly Holding Cost** | Average monthly carrying cost |
| **Break-even Timeline** | Months to break even |
| **Per Acre Analysis** | Price and profit per acre |
| **Gross Profit Margin** | Profit as % of sale price |

## Usage

1. Go to `/calculator`
2. Enter purchase price and expected sale price
3. Add all relevant costs
4. Click "Calculate Profit"
5. Review analysis and per-acre metrics

## Deal Guidelines

### Good Deal (✓)
- ROI > 20%
- Profit margin > 15%
- Holding period < 12 months
- Clear title and access

### Consider Carefully (⚠️)
- ROI 10-20%
- Extended holding period
- High renovation costs
- Zoning uncertainties

### Avoid (✗)
- ROI < 10%
- Negative cash flow
- Title issues
- No clear exit strategy

## Pro Features

### Free Tier
- ✅ Use calculator unlimited
- ✅ Copy results to clipboard
- ❌ Save calculations

### Pro Tier ($399/month)
- ✅ Save calculations to account
- ✅ Export deal analysis
- ✅ Compare multiple deals
- ✅ Historical tracking

## API

### Save Calculation (Pro only)
```http
POST /api/calculator/save
Content-Type: application/json

{
  "purchasePrice": 50000,
  "salePrice": 75000,
  "acres": 5,
  "holdingMonths": 6,
  "costs": { ... },
  "results": { ... }
}
```

Response:
```json
{
  "success": true,
  "message": "Calculation saved",
  "data": {
    "savedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Example Scenarios

### Scenario 1: Quick Flip
- Purchase: $50,000
- Sale: $75,000
- Holding: 3 months
- Costs: $5,000
- **Profit: $20,000 (40% ROI)**

### Scenario 2: Wholesale Deal
- Purchase: $0 (assignment)
- Assignment Fee: $10,000
- Sale: $60,000
- **Profit: $10,000 (instant)**

### Scenario 3: Long-term Hold
- Purchase: $100,000
- Sale: $150,000
- Holding: 12 months
- Costs: $15,000
- **Profit: $35,000 (35% ROI)**

## Tips

1. **Always include closing costs** - Both buyer and seller sides
2. **Factor in holding time** - Longer holds = higher costs
3. **Add buffer for unexpected costs** - 10-15% contingency
4. **Verify property taxes** - Can vary significantly by location
5. **Consider per-acre metrics** - Helps compare different sized properties

## Integration with Listings

Future enhancement: Click "Analyze" on any listing to auto-populate calculator with listing data.

## Support

Questions about deal analysis? Contact support@marketai.com
