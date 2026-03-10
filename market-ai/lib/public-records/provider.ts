/**
 * Abstract provider interface for public property data.
 * Implement this interface to add real data sources (CoreLogic, ATTOM, etc.)
 */

import type { PublicRecordData, PublicRecordSearchFilters } from "./types";

export interface PublicRecordProvider {
  name: string;

  /** Search/filter public records */
  search(filters: PublicRecordSearchFilters): Promise<{
    records: PublicRecordData[];
    total: number;
  }>;

  /** Get a single record by parcel ID */
  getByParcelId(parcelId: string): Promise<PublicRecordData | null>;

  /** Get a single record by internal ID */
  getById(id: string): Promise<PublicRecordData | null>;
}

/** Registry of available providers */
const providers: Map<string, PublicRecordProvider> = new Map();

export function registerProvider(provider: PublicRecordProvider) {
  providers.set(provider.name, provider);
}

export function getProvider(name: string): PublicRecordProvider | undefined {
  return providers.get(name);
}

export function getDefaultProvider(): PublicRecordProvider {
  const first = providers.values().next().value;
  if (!first) throw new Error("No public record provider registered");
  return first;
}
