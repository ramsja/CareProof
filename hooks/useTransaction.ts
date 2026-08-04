"use client";
/**
 * Reusable transaction lifecycle hook.
 * Covers: record registration, access grant, access revocation, deactivation.
 *
 * States: idle → awaiting_signature → submitted → pending → confirmed | rejected | reverted | failed
 */
import { useState, useCallback } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import type { TransactionReceipt } from "viem";
import { CAREPROOF_REGISTRY_ABI } from "@/lib/blockchain/contractAbi";
import { decodeReceiptEvents } from "@/lib/blockchain/eventDecoder";
import { parseWalletError } from "@/lib/blockchain/errors";
import type { TransactionState, DecodedContractEvent } from "@/types";

export interface TransactionResult {
  state:          TransactionState;
  txHash?:        `0x${string}`;
  receipt?:       TransactionReceipt;
  decodedEvents?: DecodedContractEvent[];
  errorMessage?:  string;
}

export function useTransaction() {
  const [state,          setState]          = useState<TransactionState>("idle");
  const [errorMessage,   setErrorMessage]   = useState<string | undefined>();
  const [decodedEvents,  setDecodedEvents]  = useState<DecodedContractEvent[]>([]);
  const [txHash,         setTxHash]         = useState<`0x${string}` | undefined>();
  const [receipt,        setReceipt]        = useState<TransactionReceipt | undefined>();

  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "") as `0x${string}`;

  const reset = useCallback(() => {
    setState("idle");
    setErrorMessage(undefined);
    setDecodedEvents([]);
    setTxHash(undefined);
    setReceipt(undefined);
  }, []);

  /**
   * Generic transaction executor — wraps any contract write call.
   * @param writeFn  A function that calls writeContractAsync and returns a tx hash.
   */
  const execute = useCallback(
    async (writeFn: () => Promise<`0x${string}`>): Promise<TransactionReceipt | null> => {
      reset();

      try {
        // Step 1: prompt wallet signature
        setState("awaiting_signature");
        const hash = await writeFn();
        setTxHash(hash);

        // Step 2: submitted
        setState("submitted");

        // Step 3: wait for receipt
        setState("pending");
        if (!publicClient) {
          setState("failed");
          setErrorMessage("Blockchain provider is unavailable.");
          return null;
        }

        const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
        setReceipt(txReceipt);

        if (txReceipt.status === "reverted") {
          setState("reverted");
          setErrorMessage("The transaction was included in a block but reverted.");
          return null;
        }

        // Step 4: decode events
        const events = decodeReceiptEvents(txReceipt);
        setDecodedEvents(events);

        setState("confirmed");
        return txReceipt;
      } catch (err: unknown) {
        const info = parseWalletError(err);
        setErrorMessage(info.message);
        setState(info.isUserRejection ? "rejected" : "failed");
        return null;
      }
    },
    [publicClient, reset],
  );

  // ─── Specific contract actions ────────────────────────────────────────────

  const registerRecord = useCallback(
    (dataHash: `0x${string}`, owner: `0x${string}`) =>
      execute(() =>
        writeContractAsync({
          address:      contractAddress,
          abi:          CAREPROOF_REGISTRY_ABI,
          functionName: "registerRecord",
          args:         [dataHash, owner],
        }),
      ),
    [execute, writeContractAsync, contractAddress],
  );

  const grantAccess = useCallback(
    (recordId: bigint, viewer: `0x${string}`) =>
      execute(() =>
        writeContractAsync({
          address:      contractAddress,
          abi:          CAREPROOF_REGISTRY_ABI,
          functionName: "grantAccess",
          args:         [recordId, viewer],
        }),
      ),
    [execute, writeContractAsync, contractAddress],
  );

  const revokeAccess = useCallback(
    (recordId: bigint, viewer: `0x${string}`) =>
      execute(() =>
        writeContractAsync({
          address:      contractAddress,
          abi:          CAREPROOF_REGISTRY_ABI,
          functionName: "revokeAccess",
          args:         [recordId, viewer],
        }),
      ),
    [execute, writeContractAsync, contractAddress],
  );

  const deactivateRecord = useCallback(
    (recordId: bigint) =>
      execute(() =>
        writeContractAsync({
          address:      contractAddress,
          abi:          CAREPROOF_REGISTRY_ABI,
          functionName: "deactivateRecord",
          args:         [recordId],
        }),
      ),
    [execute, writeContractAsync, contractAddress],
  );

  return {
    state,
    txHash,
    receipt,
    decodedEvents,
    errorMessage,
    isIdle:      state === "idle",
    isPending:   ["awaiting_signature", "submitted", "pending"].includes(state),
    isConfirmed: state === "confirmed",
    isError:     ["rejected", "reverted", "failed"].includes(state),
    reset,
    registerRecord,
    grantAccess,
    revokeAccess,
    deactivateRecord,
  };
}
