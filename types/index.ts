// ─── Record Domain Types ──────────────────────────────────────────────────────

export type RecordCategory =
  | "checkup"
  | "laboratory"
  | "prescription"
  | "vaccination"
  | "consultation"
  | "insurance"
  | "certificate"
  | "other";

export type BlockchainStatus =
  | "draft"
  | "awaiting_signature"
  | "submitted"
  | "pending"
  | "confirmed"
  | "rejected"
  | "reverted"
  | "failed";

export type VerificationStatus =
  | "not_verified"
  | "verified"
  | "modified"
  | "not_registered"
  | "deactivated"
  | "verification_error";

export type TransactionState =
  | "idle"
  | "awaiting_signature"
  | "submitted"
  | "pending"
  | "confirmed"
  | "rejected"
  | "reverted"
  | "failed";

export interface CareRecord {
  id: string;
  title: string;
  category: RecordCategory;
  providerName: string;
  serviceDate: string;
  description: string;
  externalReference?: string;
  ownerAddress: `0x${string}`;
  dataHash: `0x${string}`;
  blockchainRecordId?: string;
  transactionHash?: `0x${string}`;
  blockNumber?: string;
  blockchainStatus: BlockchainStatus;
  verificationStatus: VerificationStatus;
  deactivated: boolean;
  confirmationTime?: string;
  createdAt: string;
  updatedAt: string;
}

/** Fields used for deterministic hashing — no IDs, timestamps, or statuses */
export interface NormalizedRecord {
  title: string;
  category: RecordCategory;
  providerName: string;
  serviceDate: string; // ISO YYYY-MM-DD
  description: string;
  externalReference: string;
  ownerAddress: string; // lowercase
}

// ─── Activity Types ───────────────────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  recordId?: string;
  walletAddress: string;
  eventName: string;
  transactionHash?: string;
  blockNumber?: string;
  blockchainRecordId?: string;
  eventArgs?: Record<string, unknown>;
  timestamp: string;
}

// ─── Decoded Contract Events ──────────────────────────────────────────────────

export interface DecodedRecordRegistered {
  eventName: "RecordRegistered";
  recordId: bigint;
  dataHash: `0x${string}`;
  owner: `0x${string}`;
  creator: `0x${string}`;
  timestamp: bigint;
  transactionHash: `0x${string}`;
  blockNumber: bigint;
}

export interface DecodedAccessGranted {
  eventName: "AccessGranted";
  recordId: bigint;
  owner: `0x${string}`;
  viewer: `0x${string}`;
  timestamp: bigint;
  transactionHash: `0x${string}`;
  blockNumber: bigint;
}

export interface DecodedAccessRevoked {
  eventName: "AccessRevoked";
  recordId: bigint;
  owner: `0x${string}`;
  viewer: `0x${string}`;
  timestamp: bigint;
  transactionHash: `0x${string}`;
  blockNumber: bigint;
}

export interface DecodedRecordDeactivated {
  eventName: "RecordDeactivated";
  recordId: bigint;
  owner: `0x${string}`;
  timestamp: bigint;
  transactionHash: `0x${string}`;
  blockNumber: bigint;
}

export type DecodedContractEvent =
  | DecodedRecordRegistered
  | DecodedAccessGranted
  | DecodedAccessRevoked
  | DecodedRecordDeactivated;

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Verification ─────────────────────────────────────────────────────────────

export interface VerificationResult {
  status: VerificationStatus;
  localHash: `0x${string}`;
  onChainHash?: `0x${string}`;
  isActive?: boolean;
  verifiedAt: string;
  verifierAddress?: string;
}

// ─── Environment Health ───────────────────────────────────────────────────────

export type HealthStatus = "ready" | "connected" | "disconnected" | "wrong_network" | "unavailable" | "not_deployed" | "error";

export interface EnvironmentHealth {
  application: HealthStatus;
  database: HealthStatus;
  blockchainRpc: HealthStatus;
  smartContract: HealthStatus;
  wallet: HealthStatus;
  network: HealthStatus;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface CreateRecordFormValues {
  title: string;
  category: RecordCategory;
  providerName: string;
  serviceDate: string;
  description: string;
  externalReference: string;
  ownerAddress: string;
}

export const RECORD_CATEGORIES: { value: RecordCategory; label: string }[] = [
  { value: "checkup",      label: "Check-up" },
  { value: "laboratory",   label: "Laboratory" },
  { value: "prescription", label: "Prescription" },
  { value: "vaccination",  label: "Vaccination" },
  { value: "consultation", label: "Consultation" },
  { value: "insurance",    label: "Insurance" },
  { value: "certificate",  label: "Certificate" },
  { value: "other",        label: "Other" },
];

export const BLOCKCHAIN_STATUS_LABELS: Record<BlockchainStatus, string> = {
  draft:              "Draft",
  awaiting_signature: "Awaiting Signature",
  submitted:          "Submitted",
  pending:            "Pending Confirmation",
  confirmed:          "Confirmed",
  rejected:           "Rejected",
  reverted:           "Reverted",
  failed:             "Failed",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  not_verified:       "Not Verified",
  verified:           "Verified",
  modified:           "Modified",
  not_registered:     "Not Registered",
  deactivated:        "Deactivated",
  verification_error: "Verification Error",
};
