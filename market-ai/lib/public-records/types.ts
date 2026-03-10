/**
 * TypeScript types for public property/land records.
 */

export interface DeedRecord {
  date: string;           // YYYY-MM-DD
  grantor: string;
  grantee: string;
  salePrice: number;
  deedType: string;       // "Warranty Deed" | "Quitclaim Deed" | etc.
  recordingNumber?: string;
}

export interface Lien {
  type: string;           // "mortgage" | "tax" | "judgment" | "mechanic"
  holder: string;
  amount: number;
  recordedDate: string;
  status: "active" | "released" | "pending";
}

export interface Improvement {
  type: string;           // "house" | "barn" | "well" | "septic" | "fence" | etc.
  yearBuilt?: number;
  squareFeet?: number;
  description?: string;
  value?: number;
}

export interface PublicRecordData {
  id: string;
  parcelId: string;

  // Owner info
  ownerName: string;
  ownerMailingAddress: string;
  isOutOfState: boolean;

  // Location
  propertyAddress: string;
  state: string;
  county: string;

  // Valuation
  assessedValue: number;
  marketValue: number;

  // Tax
  taxStatus: TaxStatus;
  taxDelinquentYears?: number;
  annualTaxAmount?: number;

  // Land
  zoning: string;
  lotSizeAcres: number;

  // Improvements (structures on land)
  improvements: Improvement[];

  // History
  deedHistory: DeedRecord[];
  liens: Lien[];

  // Ownership duration in months
  ownershipDuration: number;

  // Last sale
  lastSaleDate?: string;
  lastSalePrice?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export type TaxStatus = "current" | "delinquent" | "tax_sale" | "exempt";

export interface PublicRecordSearchFilters {
  state?: string;
  county?: string;
  minMarketValue?: number;
  maxMarketValue?: number;
  minLotAcres?: number;
  maxLotAcres?: number;
  taxStatus?: TaxStatus | "";
  isOutOfState?: boolean;
  zoning?: string;
  ownerName?: string;
  query?: string;
  skip?: number;
  take?: number;
}
