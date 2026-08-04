import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionStatus } from "@/components/blockchain/TransactionStatus";

describe("TransactionStatus", () => {
  it("renders nothing when state is idle", () => {
    const { container } = render(<TransactionStatus state="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it("shows awaiting signature message", () => {
    render(<TransactionStatus state="awaiting_signature" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/awaiting wallet/i)).toBeInTheDocument();
  });

  it("shows confirmed badge on success", () => {
    render(<TransactionStatus state="confirmed" />);
    const matches = screen.getAllByText(/confirmed/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows rejected badge and error message", () => {
    render(<TransactionStatus state="rejected" errorMessage="User rejected the request." />);
    const badges = screen.getAllByText(/rejected/i);
    expect(badges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("User rejected the request.")).toBeInTheDocument();
  });

  it("shows pending spinner", () => {
    render(<TransactionStatus state="pending" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    // Spinner is present for pending state
    const container = screen.getByRole("status");
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("displays transaction hash when provided", () => {
    const hash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab";
    render(<TransactionStatus state="confirmed" txHash={hash as `0x${string}`} />);
    expect(screen.getByText(/transaction hash/i)).toBeInTheDocument();
  });
});
