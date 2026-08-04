/**
 * Deterministic record normalization.
 *
 * Rules:
 * - Trim all text fields
 * - Lowercase the owner address
 * - Use ISO YYYY-MM-DD for serviceDate
 * - Convert missing externalReference to ""
 * - Fixed property order (matches the on-chain hash)
 * - Excludes: id, timestamps, blockchain status, verification status, UI state
 */
import type { NormalizedRecord, RecordCategory } from "@/types";

export interface RecordNormalizationInput {
  title: string;
  category: RecordCategory | string;
  providerName: string;
  serviceDate: string | Date;
  description: string;
  externalReference?: string | null;
  ownerAddress: string;
}

/**
 * Normalize a record into a canonical, deterministic object.
 * The same logical record always produces the same normalized object.
 */
export function normalizeRecord(input: RecordNormalizationInput): NormalizedRecord {
  return {
    title:             input.title.trim(),
    category:          input.category as RecordCategory,
    providerName:      input.providerName.trim(),
    serviceDate:       toISODate(input.serviceDate),
    description:       input.description.trim(),
    externalReference: (input.externalReference ?? "").trim(),
    ownerAddress:      input.ownerAddress.toLowerCase(),
  };
}

/**
 * Convert a date value to ISO YYYY-MM-DD string.
 * Accepts a Date object, ISO string, or YYYY-MM-DD string.
 */
export function toISODate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  // Parse ISO or other parseable strings
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return d.toISOString().slice(0, 10);
}
