import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WalletButton } from "@/components/wallet/WalletButton";

// Mock the wallet hook — avoids needing a full Wagmi provider in tests
vi.mock("@/hooks/useWalletState", () => ({
  useWalletState: vi.fn(),
}));

import { useWalletState } from "@/hooks/useWalletState";
const mockUseWalletState = vi.mocked(useWalletState);

const defaultMock = {
  address:                  undefined,
  isConnected:              false,
  isCorrectNetwork:         false,
  status:                   "disconnected" as const,
  chain:                    undefined,
  connector:                undefined,
  balance:                  undefined,
  rawBalance:               undefined,
  isConnectPending:         false,
  isSwitchPending:          false,
  connectError:             null,
  connectWallet:            vi.fn(),
  disconnect:               vi.fn(),
  switchToSupportedNetwork: vi.fn(),
  addNetwork:               vi.fn(),
};

describe("WalletButton", () => {
  it("shows Install MetaMask link when no wallet is detected", () => {
    mockUseWalletState.mockReturnValue({ ...defaultMock, status: "no_wallet" });
    render(<WalletButton />);
    expect(screen.getByText(/install metamask/i)).toBeInTheDocument();
  });

  it("shows Connect Wallet button when disconnected", () => {
    mockUseWalletState.mockReturnValue({ ...defaultMock, status: "disconnected" });
    render(<WalletButton />);
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeInTheDocument();
  });

  it("shows Switch Network button when on wrong network", () => {
    mockUseWalletState.mockReturnValue({ ...defaultMock, status: "wrong_network", isConnected: true });
    render(<WalletButton />);
    expect(screen.getByRole("button", { name: /switch network/i })).toBeInTheDocument();
  });

  it("shows Disconnect button when connected", () => {
    mockUseWalletState.mockReturnValue({
      ...defaultMock,
      status:           "connected",
      isConnected:      true,
      isCorrectNetwork: true,
      address:          "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      balance:          "10.0000 ETH",
      chain:            { id: 31337, name: "CareProof Local" } as never,
    });
    render(<WalletButton />);
    expect(screen.getByRole("button", { name: /disconnect/i })).toBeInTheDocument();
  });
});
