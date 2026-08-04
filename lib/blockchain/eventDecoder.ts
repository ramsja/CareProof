/**
 * Event decoding utilities.
 *
 * Decodes raw transaction receipt logs into typed CareProof event objects.
 * All decoding is done from actual receipt logs — never constructed from UI input.
 */
import { decodeEventLog, type Log, type TransactionReceipt } from "viem";
import { CAREPROOF_REGISTRY_ABI } from "./contractAbi";
import type {
  DecodedContractEvent,
  DecodedRecordRegistered,
  DecodedAccessGranted,
  DecodedAccessRevoked,
  DecodedRecordDeactivated,
} from "@/types";

/**
 * Decode all CareProof events from a transaction receipt.
 * Returns an array of typed event objects.
 */
export function decodeReceiptEvents(receipt: TransactionReceipt): DecodedContractEvent[] {
  const events: DecodedContractEvent[] = [];

  for (const log of receipt.logs) {
    const decoded = tryDecodeLog(log, receipt);
    if (decoded) events.push(decoded);
  }

  return events;
}

/**
 * Attempt to decode a single log entry.
 * Returns null if the log does not match any known event.
 */
export function tryDecodeLog(
  log: Log,
  receipt: TransactionReceipt,
): DecodedContractEvent | null {
  try {
    const decoded = decodeEventLog({
      abi: CAREPROOF_REGISTRY_ABI,
      data: log.data,
      topics: log.topics,
    });

    const base = {
      transactionHash: receipt.transactionHash,
      blockNumber:     receipt.blockNumber,
    };

    switch (decoded.eventName) {
      case "RecordRegistered": {
        const args = decoded.args as {
          recordId: bigint;
          dataHash: `0x${string}`;
          owner: `0x${string}`;
          creator: `0x${string}`;
          timestamp: bigint;
        };
        return {
          eventName:       "RecordRegistered",
          recordId:        args.recordId,
          dataHash:        args.dataHash,
          owner:           args.owner,
          creator:         args.creator,
          timestamp:       args.timestamp,
          ...base,
        } satisfies DecodedRecordRegistered;
      }

      case "AccessGranted": {
        const args = decoded.args as {
          recordId: bigint;
          owner: `0x${string}`;
          viewer: `0x${string}`;
          timestamp: bigint;
        };
        return {
          eventName: "AccessGranted",
          recordId:  args.recordId,
          owner:     args.owner,
          viewer:    args.viewer,
          timestamp: args.timestamp,
          ...base,
        } satisfies DecodedAccessGranted;
      }

      case "AccessRevoked": {
        const args = decoded.args as {
          recordId: bigint;
          owner: `0x${string}`;
          viewer: `0x${string}`;
          timestamp: bigint;
        };
        return {
          eventName: "AccessRevoked",
          recordId:  args.recordId,
          owner:     args.owner,
          viewer:    args.viewer,
          timestamp: args.timestamp,
          ...base,
        } satisfies DecodedAccessRevoked;
      }

      case "RecordDeactivated": {
        const args = decoded.args as {
          recordId: bigint;
          owner: `0x${string}`;
          timestamp: bigint;
        };
        return {
          eventName: "RecordDeactivated",
          recordId:  args.recordId,
          owner:     args.owner,
          timestamp: args.timestamp,
          ...base,
        } satisfies DecodedRecordDeactivated;
      }

      default:
        return null;
    }
  } catch {
    // Log does not match any known event — silently skip
    return null;
  }
}

/**
 * Find the first RecordRegistered event in a receipt.
 */
export function findRecordRegisteredEvent(
  receipt: TransactionReceipt,
): DecodedRecordRegistered | null {
  const events = decodeReceiptEvents(receipt);
  return (events.find((e) => e.eventName === "RecordRegistered") as DecodedRecordRegistered) ?? null;
}

/**
 * Format a bigint Unix timestamp as a localised date-time string.
 */
export function formatEventTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toISOString();
}
