/**
 * ABI for CareProofRegistry.sol
 * Kept as a typed constant so it can be used both in the browser (wagmi/viem)
 * and server-side (viem public client for reads).
 */
export const CAREPROOF_REGISTRY_ABI = [
  // ─── Write ─────────────────────────────────────────────────────────────────
  {
    name: "registerRecord",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "dataHash", type: "bytes32" },
      { name: "owner",    type: "address" },
    ],
    outputs: [{ name: "recordId", type: "uint256" }],
  },
  {
    name: "grantAccess",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recordId", type: "uint256" },
      { name: "viewer",   type: "address" },
    ],
    outputs: [],
  },
  {
    name: "revokeAccess",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recordId", type: "uint256" },
      { name: "viewer",   type: "address" },
    ],
    outputs: [],
  },
  {
    name: "deactivateRecord",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "recordId", type: "uint256" }],
    outputs: [],
  },
  // ─── Read ──────────────────────────────────────────────────────────────────
  {
    name: "getRecord",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "recordId", type: "uint256" }],
    outputs: [
      { name: "dataHash",  type: "bytes32" },
      { name: "owner",     type: "address" },
      { name: "creator",   type: "address" },
      { name: "createdAt", type: "uint256" },
      { name: "active",    type: "bool"    },
    ],
  },
  {
    name: "verifyRecord",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "recordId",     type: "uint256" },
      { name: "expectedHash", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "hasAccess",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "recordId", type: "uint256" },
      { name: "viewer",   type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "recordExists",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "recordId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "nextRecordId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // ─── Events ────────────────────────────────────────────────────────────────
  {
    name: "RecordRegistered",
    type: "event",
    inputs: [
      { name: "recordId",  type: "uint256", indexed: true  },
      { name: "dataHash",  type: "bytes32", indexed: true  },
      { name: "owner",     type: "address", indexed: true  },
      { name: "creator",   type: "address", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "AccessGranted",
    type: "event",
    inputs: [
      { name: "recordId",  type: "uint256", indexed: true  },
      { name: "owner",     type: "address", indexed: true  },
      { name: "viewer",    type: "address", indexed: true  },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "AccessRevoked",
    type: "event",
    inputs: [
      { name: "recordId",  type: "uint256", indexed: true  },
      { name: "owner",     type: "address", indexed: true  },
      { name: "viewer",    type: "address", indexed: true  },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "RecordDeactivated",
    type: "event",
    inputs: [
      { name: "recordId",  type: "uint256", indexed: true  },
      { name: "owner",     type: "address", indexed: true  },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export type CareProofRegistryAbi = typeof CAREPROOF_REGISTRY_ABI;
