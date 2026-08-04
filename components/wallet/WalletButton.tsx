"use client";
import { useWalletState } from "@/hooks/useWalletState";
import { Button } from "@/components/ui/Button";
import { truncateAddress } from "@/lib/utils";
import { CopyButton } from "@/components/ui/CopyButton";

export function WalletButton() {
  const {
    address,
    status,
    balance,
    chain,
    isConnectPending,
    isSwitchPending,
    connectWallet,
    disconnect,
    switchToSupportedNetwork,
    addNetwork,
  } = useWalletState();

  if (status === "no_wallet") {
    return (
      <a
        href="https://metamask.io"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-5h2v2h-2zm0-8h2v6h-2z" />
        </svg>
        Install MetaMask
      </a>
    );
  }

  if (status === "disconnected" || status === "connecting") {
    return (
      <Button
        size="sm"
        onClick={connectWallet}
        loading={isConnectPending || status === "connecting"}
        aria-label="Connect wallet"
      >
        Connect Wallet
      </Button>
    );
  }

  if (status === "wrong_network") {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
          Wrong Network
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={switchToSupportedNetwork}
          loading={isSwitchPending}
        >
          Switch Network
        </Button>
        <Button size="sm" variant="ghost" onClick={addNetwork}>
          Add Network
        </Button>
      </div>
    );
  }

  // Connected + correct network
  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex flex-col items-end text-right">
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs font-medium text-gray-800">
            {truncateAddress(address ?? "")}
          </span>
          {address && <CopyButton value={address} label="address" />}
        </div>
        <span className="text-xs text-gray-500">
          {balance ?? "—"} · {chain?.name ?? "—"}
        </span>
      </div>
      <Button size="sm" variant="outline" onClick={() => disconnect()}>
        Disconnect
      </Button>
    </div>
  );
}
