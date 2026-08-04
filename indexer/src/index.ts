/**
 * CareProof blockchain event indexer — STUB
 *
 * Purpose:
 *   Index CareProofRegistry contract events from the local Hardhat node
 *   into SQLite (IndexedEvent + ChainCursor).
 *
 * This file is intentionally incomplete. Implement the indexing service here.
 *
 * Expected behavior (high level):
 *   1. Load RPC URL + contract address from env
 *   2. Create a viem public client
 *   3. Read ChainCursor for chainId 31337 (or start from deployment/start block)
 *   4. Fetch historical logs for CareProofRegistry events
 *   5. Insert IndexedEvent rows without duplicates
 *   6. Update ChainCursor after successful processing
 *   7. Continue polling for new blocks
 *   8. Detect local chain reset (current block < cursor) and recover safely
 *
 * Useful imports already in this project:
 *   - CAREPROOF_REGISTRY_ABI from "@/lib/blockchain/contractAbi"
 *   - prisma from "@/lib/db"
 *   - viem createPublicClient / http / parseEventLogs
 *
 * Run:
 *   npm run indexer
 */

import "dotenv/config";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? process.env.HARDHAT_RPC_URL ?? "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337");

async function main(): Promise<void> {
  console.log("[indexer] CareProof event indexer stub");
  console.log(`[indexer] RPC: ${RPC_URL}`);
  console.log(`[indexer] chainId: ${CHAIN_ID}`);
  console.log(
    `[indexer] contract: ${CONTRACT_ADDRESS || "(missing NEXT_PUBLIC_CONTRACT_ADDRESS)"}`,
  );
  console.log("[indexer] Not implemented yet. See indexer/README.md.");

  // TODO: implement event indexing against CareProofRegistry
  // TODO: persist IndexedEvent rows
  // TODO: persist / advance ChainCursor
  // TODO: poll for new blocks after historical catch-up

  process.exitCode = 0;
}

main().catch((error: unknown) => {
  console.error("[indexer] fatal error:", error);
  process.exitCode = 1;
});
