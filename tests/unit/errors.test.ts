import { describe, it, expect } from "vitest";
import { parseWalletError, transactionStateMessage } from "@/lib/blockchain/errors";

describe("parseWalletError", () => {
  it("identifies user rejection by code 4001", () => {
    const result = parseWalletError({ code: 4001, message: "User rejected" });
    expect(result.isUserRejection).toBe(true);
    expect(result.code).toBe("USER_REJECTED");
  });

  it("identifies user rejection by message text", () => {
    const result = parseWalletError({ code: -1, message: "User denied transaction signature." });
    expect(result.isUserRejection).toBe(true);
  });

  it("identifies insufficient funds", () => {
    const result = parseWalletError({ message: "insufficient funds for gas" });
    expect(result.code).toBe("INSUFFICIENT_FUNDS");
    expect(result.isUserRejection).toBe(false);
  });

  it("identifies contract revert", () => {
    const result = parseWalletError({ message: "execution reverted: AccessAlreadyGranted" });
    expect(result.code).toBe("CONTRACT_REVERTED");
  });

  it("identifies RPC unavailability", () => {
    const result = parseWalletError({ message: "could not detect network" });
    expect(result.code).toBe("RPC_UNAVAILABLE");
  });

  it("returns generic error for unknown error", () => {
    const result = parseWalletError({ message: "something entirely unexpected" });
    expect(result.code).toBe("TRANSACTION_ERROR");
    expect(result.isUserRejection).toBe(false);
  });

  it("handles null gracefully", () => {
    const result = parseWalletError(null);
    expect(result.code).toBe("UNKNOWN");
  });
});

describe("transactionStateMessage", () => {
  it("returns the correct message for awaiting_signature", () => {
    expect(transactionStateMessage("awaiting_signature")).toContain("wallet");
  });

  it("returns the correct message for confirmed", () => {
    expect(transactionStateMessage("confirmed")).toContain("confirmed");
  });

  it("returns the correct message for rejected", () => {
    expect(transactionStateMessage("rejected")).toContain("rejected");
  });

  it("returns a fallback for unknown state", () => {
    expect(transactionStateMessage("unknown_state")).toBeTruthy();
  });
});
