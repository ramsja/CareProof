"use client";
import { useWalletState } from "@/hooks/useWalletState";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { StatusDot } from "@/components/ui/StatusDot";
import { truncateAddress } from "@/lib/utils";

export function WalletPanel() {
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

  const healthStatus =
    status === "connected"     ? "connected"     :
    status === "wrong_network" ? "wrong_network" :
    status === "no_wallet"     ? "unavailable"   :
    "disconnected";

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-gray-900">Wallet</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <StatusDot status={healthStatus} label={
            status === "no_wallet"     ? "No wallet detected"     :
            status === "disconnected"  ? "Disconnected"           :
            status === "connecting"    ? "Connecting…"            :
            status === "connected"     ? "Connected"              :
            status === "wrong_network" ? "Wrong Network"          :
            "Unknown"
          } />
          {status === "connected" && (
            <button
              onClick={() => disconnect()}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 rounded"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Address */}
        {address && (
          <div>
            <p className="mb-0.5 text-xs text-gray-500">Address</p>
            <div className="flex items-center gap-1">
              <code className="font-mono text-xs text-gray-800 break-all">
                {truncateAddress(address, 6)}
              </code>
              <CopyButton value={address} label="address" />
            </div>
          </div>
        )}

        {/* Network + Balance */}
        {status === "connected" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-0.5 text-xs text-gray-500">Network</p>
              <p className="text-sm font-medium text-gray-800">{chain?.name ?? "—"}</p>
              <p className="text-xs text-gray-400">Chain ID {chain?.id}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs text-gray-500">Balance</p>
              <p className="text-sm font-medium text-gray-800">{balance ?? "—"}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {status === "no_wallet" && (
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-center text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors"
          >
            Install MetaMask
          </a>
        )}
        {(status === "disconnected" || status === "connecting") && (
          <Button className="w-full" onClick={connectWallet} loading={isConnectPending}>
            Connect Wallet
          </Button>
        )}
        {status === "wrong_network" && (
          <div className="space-y-2">
            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5">
              Please switch to the CareProof Local network (Chain ID 31337).
            </p>
            <Button className="w-full" onClick={switchToSupportedNetwork} loading={isSwitchPending}>
              Switch to CareProof Local
            </Button>
            <Button className="w-full" variant="outline" onClick={addNetwork}>
              Add CareProof Local Network
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
