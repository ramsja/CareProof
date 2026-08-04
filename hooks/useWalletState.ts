"use client";
/**
 * Unified wallet state hook.
 * Exposes connection status, address, chain, balance, and network actions
 * in one place so components stay thin.
 */
import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { addNetworkParams, SUPPORTED_CHAIN_ID, isSupportedChain } from "@/lib/blockchain/network";

export type WalletStatus =
  | "no_wallet"
  | "disconnected"
  | "connecting"
  | "connected"
  | "wrong_network"
  | "rejected";

export function useWalletState() {
  const { address, isConnected, isConnecting, chain, connector } = useAccount();
  const { connect, isPending: isConnectPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();

  const { data: balanceData } = useBalance({
    address,
    query: { enabled: isConnected },
  });

  // Detect whether a wallet injector is available
  const hasInjectedWallet =
    typeof window !== "undefined" && typeof window.ethereum !== "undefined";

  const isCorrectNetwork = isSupportedChain(chain?.id);

  const status: WalletStatus = (() => {
    if (!hasInjectedWallet) return "no_wallet";
    if (!isConnected && !isConnecting) return "disconnected";
    if (isConnecting || isConnectPending) return "connecting";
    if (isConnected && !isCorrectNetwork) return "wrong_network";
    if (isConnected) return "connected";
    return "disconnected";
  })();

  const connectWallet = () => connect({ connector: injected() });

  const switchToSupportedNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: SUPPORTED_CHAIN_ID });
    }
  };

  /** Prompt MetaMask to add the CareProof Local network */
  const addNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [addNetworkParams],
      });
    } catch {
      // User rejected or already added — silently handle
    }
  };

  return {
    address,
    isConnected,
    isCorrectNetwork,
    status,
    chain,
    connector,
    balance: balanceData
      ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
      : undefined,
    rawBalance: balanceData,
    isConnectPending,
    isSwitchPending,
    connectError,
    connectWallet,
    disconnect,
    switchToSupportedNetwork,
    addNetwork,
  };
}
