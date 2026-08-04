"use client";
/**
 * Hooks for reading from the CareProofRegistry contract.
 */
import { useReadContract, useReadContracts } from "wagmi";
import { CAREPROOF_REGISTRY_ABI } from "@/lib/blockchain/contractAbi";

const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "") as `0x${string}`;

/** Read a single record from the contract */
export function useOnChainRecord(recordId: bigint | undefined) {
  return useReadContract({
    address:      contractAddress,
    abi:          CAREPROOF_REGISTRY_ABI,
    functionName: "getRecord",
    args:         recordId !== undefined ? [recordId] : undefined,
    query: {
      enabled: !!contractAddress && recordId !== undefined,
    },
  });
}

/** Verify whether a local hash matches the on-chain stored hash */
export function useVerifyRecord(recordId: bigint | undefined, expectedHash: `0x${string}` | undefined) {
  return useReadContract({
    address:      contractAddress,
    abi:          CAREPROOF_REGISTRY_ABI,
    functionName: "verifyRecord",
    args:
      recordId !== undefined && expectedHash
        ? [recordId, expectedHash]
        : undefined,
    query: {
      enabled: !!contractAddress && recordId !== undefined && !!expectedHash,
    },
  });
}

/** Check whether a viewer has been granted access */
export function useHasAccess(recordId: bigint | undefined, viewer: `0x${string}` | undefined) {
  return useReadContract({
    address:      contractAddress,
    abi:          CAREPROOF_REGISTRY_ABI,
    functionName: "hasAccess",
    args:
      recordId !== undefined && viewer
        ? [recordId, viewer]
        : undefined,
    query: {
      enabled: !!contractAddress && recordId !== undefined && !!viewer,
    },
  });
}

/** Check whether a record exists on-chain */
export function useRecordExists(recordId: bigint | undefined) {
  return useReadContract({
    address:      contractAddress,
    abi:          CAREPROOF_REGISTRY_ABI,
    functionName: "recordExists",
    args:         recordId !== undefined ? [recordId] : undefined,
    query: {
      enabled: !!contractAddress && recordId !== undefined,
    },
  });
}
