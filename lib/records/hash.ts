/**
 * Deterministic record hashing using viem's keccak256.
 *
 * The hash is computed over the JSON-stringified normalized record
 * with a fixed property order (defined in normalizeRecord).
 */
import { keccak256, toBytes } from "viem";
import { normalizeRecord, type RecordNormalizationInput } from "./normalize";
import type { NormalizedRecord } from "@/types";

/**
 * Generate a keccak256 hash from a normalized record object.
 * Used both locally and to verify against the on-chain stored hash.
 */
export function hashNormalizedRecord(normalized: NormalizedRecord): `0x${string}` {
  return keccak256(toBytes(JSON.stringify(normalized)));
}

/**
 * Convenience: normalize input then hash in one step.
 */
export function hashRecord(input: RecordNormalizationInput): `0x${string}` {
  return hashNormalizedRecord(normalizeRecord(input));
}
