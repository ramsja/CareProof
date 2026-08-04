/**
 * Converts raw wallet / contract / RPC errors into safe, user-facing messages.
 * Never exposes stack traces, private configuration, or secrets.
 */

export interface WalletErrorInfo {
  code: string;
  message: string;
  isUserRejection: boolean;
}

/**
 * Classify and sanitise a wallet or provider error.
 */
export function parseWalletError(error: unknown): WalletErrorInfo {
  if (!error || typeof error !== "object") {
    return { code: "UNKNOWN", message: "An unexpected error occurred.", isUserRejection: false };
  }

  const err = error as Record<string, unknown>;
  const code    = typeof err["code"]    === "number" ? err["code"]    : undefined;
  const message = typeof err["message"] === "string" ? err["message"] : "";
  const name    = typeof err["name"]    === "string" ? err["name"]    : "";

  // User rejected the request in the wallet
  if (
    code === 4001 ||
    message.toLowerCase().includes("user rejected") ||
    message.toLowerCase().includes("user denied") ||
    name === "UserRejectedRequestError"
  ) {
    return {
      code:            "USER_REJECTED",
      message:         "The transaction request was rejected in your wallet.",
      isUserRejection: true,
    };
  }

  // Wallet not found
  if (code === 4902 || message.toLowerCase().includes("unrecognized chain")) {
    return {
      code:            "UNRECOGNIZED_CHAIN",
      message:         "This network is not recognised by your wallet. Use the Add Network action.",
      isUserRejection: false,
    };
  }

  // Insufficient funds
  if (
    message.toLowerCase().includes("insufficient funds") ||
    message.toLowerCase().includes("insufficient balance")
  ) {
    return {
      code:            "INSUFFICIENT_FUNDS",
      message:         "Insufficient funds to cover gas fees.",
      isUserRejection: false,
    };
  }

  // Contract revert
  if (
    message.toLowerCase().includes("revert") ||
    message.toLowerCase().includes("execution reverted")
  ) {
    return {
      code:            "CONTRACT_REVERTED",
      message:         "The transaction was included in a block but the contract reverted it.",
      isUserRejection: false,
    };
  }

  // RPC / network issue
  if (
    message.toLowerCase().includes("could not detect network") ||
    message.toLowerCase().includes("network error") ||
    message.toLowerCase().includes("failed to fetch")
  ) {
    return {
      code:            "RPC_UNAVAILABLE",
      message:         "Could not connect to the blockchain provider. Ensure the local Hardhat node is running.",
      isUserRejection: false,
    };
  }

  // Contract not deployed
  if (message.toLowerCase().includes("contract not found") || message.toLowerCase().includes("no bytecode")) {
    return {
      code:            "CONTRACT_NOT_DEPLOYED",
      message:         "The smart contract is not deployed on the current network.",
      isUserRejection: false,
    };
  }

  // Default fallback — never leak raw message
  return {
    code:            "TRANSACTION_ERROR",
    message:         "The transaction could not be completed. Please try again.",
    isUserRejection: false,
  };
}

/**
 * Returns a human-readable label for a transaction state.
 */
export function transactionStateMessage(state: string): string {
  const map: Record<string, string> = {
    idle:               "Ready",
    awaiting_signature: "Confirm this transaction in your wallet.",
    submitted:          "The transaction was submitted to the network.",
    pending:            "Waiting for blockchain confirmation…",
    confirmed:          "The blockchain transaction was confirmed successfully.",
    rejected:           "The transaction request was rejected.",
    reverted:           "The transaction was included in a block but reverted.",
    failed:             "The application could not communicate with the blockchain provider.",
  };
  return map[state] ?? "Unknown status.";
}
