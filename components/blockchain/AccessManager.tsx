"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { TransactionStatus } from "./TransactionStatus";
import { Dialog } from "@/components/ui/Dialog";
import { useTransaction } from "@/hooks/useTransaction";
import { useWalletState } from "@/hooks/useWalletState";
import { isValidAddress, truncateAddress } from "@/lib/utils";
import type { CareRecord } from "@/types";

interface AccessManagerProps {
  record: CareRecord;
  onActivityLogged?: () => void;
}

export function AccessManager({ record, onActivityLogged }: AccessManagerProps) {
  const { address, status } = useWalletState();
  const tx = useTransaction();

  const [grantAddress,  setGrantAddress]  = useState("");
  const [grantError,    setGrantError]    = useState("");
  const [revokeTarget,  setRevokeTarget]  = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const isOwner     = address?.toLowerCase() === record.ownerAddress.toLowerCase();
  const blockchainId = record.blockchainRecordId ? BigInt(record.blockchainRecordId) : undefined;
  const isConnected = status === "connected";

  const handleGrant = async () => {
    setGrantError("");
    if (!isValidAddress(grantAddress)) {
      setGrantError("Enter a valid EVM address.");
      return;
    }
    if (grantAddress.toLowerCase() === record.ownerAddress.toLowerCase()) {
      setGrantError("Cannot grant access to the record owner.");
      return;
    }
    if (!blockchainId) return;

    tx.reset();
    const receipt = await tx.grantAccess(blockchainId, grantAddress as `0x${string}`);
    if (receipt) {
      setGrantAddress("");
      // Log activity
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId:          record.id,
          walletAddress:     address,
          eventName:         "AccessGranted",
          transactionHash:   receipt.transactionHash,
          blockNumber:       receipt.blockNumber.toString(),
          blockchainRecordId: record.blockchainRecordId,
          eventArgs: { viewer: grantAddress, owner: address },
        }),
      });
      onActivityLogged?.();
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget || !blockchainId) return;
    setConfirmRevoke(false);
    tx.reset();
    const receipt = await tx.revokeAccess(blockchainId, revokeTarget as `0x${string}`);
    if (receipt) {
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId:          record.id,
          walletAddress:     address,
          eventName:         "AccessRevoked",
          transactionHash:   receipt.transactionHash,
          blockNumber:       receipt.blockNumber.toString(),
          blockchainRecordId: record.blockchainRecordId,
          eventArgs: { viewer: revokeTarget, owner: address },
        }),
      });
      setRevokeTarget(null);
      onActivityLogged?.();
    }
  };

  const handleDeactivate = async () => {
    if (!blockchainId) return;
    setConfirmDeactivate(false);
    tx.reset();
    const receipt = await tx.deactivateRecord(blockchainId);
    if (receipt) {
      await fetch(`/api/records/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockchainStatus:   "confirmed",
          verificationStatus: "deactivated",
          deactivated:        true,
          transactionHash:    receipt.transactionHash,
          blockNumber:        receipt.blockNumber.toString(),
          confirmationTime:   new Date().toISOString(),
        }),
      });
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId:          record.id,
          walletAddress:     address,
          eventName:         "RecordDeactivated",
          transactionHash:   receipt.transactionHash,
          blockNumber:       receipt.blockNumber.toString(),
          blockchainRecordId: record.blockchainRecordId,
          eventArgs: { owner: address },
        }),
      });
      onActivityLogged?.();
    }
  };

  if (!isOwner) return null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-gray-900">Access Management</h2>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Grant access */}
        {!record.deactivated && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Grant Access</p>
            <FormField label="Viewer wallet address" htmlFor="grant-addr" error={grantError}>
              <div className="flex gap-2">
                <Input
                  id="grant-addr"
                  value={grantAddress}
                  onChange={(e) => { setGrantAddress(e.target.value); setGrantError(""); }}
                  placeholder="0x…"
                  error={!!grantError}
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleGrant}
                  loading={tx.isPending}
                  disabled={!isConnected || !blockchainId}
                >
                  Grant
                </Button>
              </div>
            </FormField>
          </div>
        )}

        {/* Revoke — placeholder: in a real app you'd list known viewers from events */}
        {!record.deactivated && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Revoke Access</p>
            <FormField label="Address to revoke" htmlFor="revoke-addr">
              <div className="flex gap-2">
                <Input
                  id="revoke-addr"
                  value={revokeTarget ?? ""}
                  onChange={(e) => setRevokeTarget(e.target.value)}
                  placeholder="0x…"
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => revokeTarget && setConfirmRevoke(true)}
                  disabled={!isConnected || !blockchainId || !revokeTarget}
                >
                  Revoke
                </Button>
              </div>
            </FormField>
          </div>
        )}

        {/* Transaction status */}
        <TransactionStatus
          state={tx.state}
          txHash={tx.txHash}
          receipt={tx.receipt}
          decodedEvents={tx.decodedEvents}
          errorMessage={tx.errorMessage}
        />

        {/* Deactivate */}
        {!record.deactivated && (
          <div className="border-t pt-4">
            <p className="mb-2 text-xs text-gray-500">
              Deactivating preserves the on-chain history but marks the record inactive. This cannot be undone.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmDeactivate(true)}
              disabled={!isConnected || !blockchainId}
            >
              Deactivate Record
            </Button>
          </div>
        )}

        {record.deactivated && (
          <Badge variant="warning">Record is deactivated</Badge>
        )}
      </CardContent>

      {/* Revoke confirm dialog */}
      <Dialog
        open={confirmRevoke}
        onClose={() => setConfirmRevoke(false)}
        title="Confirm Revoke Access"
        description={`Revoke access for ${revokeTarget ? truncateAddress(revokeTarget) : "this address"}? A blockchain transaction is required.`}
      >
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" size="sm" onClick={() => setConfirmRevoke(false)}>Cancel</Button>
          <Button variant="danger"  size="sm" onClick={handleRevoke}>Confirm Revoke</Button>
        </div>
      </Dialog>

      {/* Deactivate confirm dialog */}
      <Dialog
        open={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        title="Confirm Deactivation"
        description="This will deactivate the record on the blockchain. The action is irreversible. On-chain history is preserved."
      >
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" size="sm" onClick={() => setConfirmDeactivate(false)}>Cancel</Button>
          <Button variant="danger"  size="sm" onClick={handleDeactivate}>Deactivate</Button>
        </div>
      </Dialog>
    </Card>
  );
}
