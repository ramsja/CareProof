/**
 * GET /api/health  — environment health check
 *
 * Checks: database, blockchain RPC, smart contract deployment.
 * Never exposes secrets, private keys, or stack traces.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPublicClient, http } from "viem";
import { careproofLocal } from "@/lib/blockchain/network";
import { CAREPROOF_REGISTRY_ABI } from "@/lib/blockchain/contractAbi";
import type { HealthStatus, EnvironmentHealth } from "@/types";

export async function GET() {
  const health: EnvironmentHealth = {
    application:    "ready",
    database:       "disconnected",
    blockchainRpc:  "disconnected",
    smartContract:  "not_deployed",
    wallet:         "disconnected", // client-side only — always unknown here
    network:        "disconnected",
  };

  // ── Database ───────────────────────────────────────────────────────────────
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = "ready";
  } catch {
    health.database = "error";
  }

  // ── Blockchain RPC ─────────────────────────────────────────────────────────
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545";
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

  try {
    const client = createPublicClient({
      chain:     careproofLocal,
      transport: http(rpcUrl, { timeout: 3_000 }),
    });

    const blockNumber = await client.getBlockNumber();
    health.blockchainRpc = "connected";
    health.network       = "connected";

    // ── Smart Contract ───────────────────────────────────────────────────────
    if (contractAddress && /^0x[0-9a-fA-F]{40}$/.test(contractAddress)) {
      try {
        // nextRecordId() is a safe read that fails if contract is not deployed
        await client.readContract({
          address:      contractAddress as `0x${string}`,
          abi:          CAREPROOF_REGISTRY_ABI,
          functionName: "nextRecordId",
        });
        health.smartContract = "ready";
      } catch {
        health.smartContract = "not_deployed";
      }
    } else {
      health.smartContract = "not_deployed";
    }

    void blockNumber; // used implicitly to confirm RPC connection
  } catch {
    health.blockchainRpc = "unavailable";
    health.network       = "unavailable";
    health.smartContract = "unavailable";
  }

  const allReady = (
    health.database      === "ready" &&
    health.blockchainRpc === "connected" &&
    health.smartContract === "ready"
  );

  return NextResponse.json(
    { success: true, data: { health, allReady } },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
