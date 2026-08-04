"use client";
import { useState } from "react";
import { usePublicClient } from "wagmi";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HashDisplay } from "@/components/ui/HashDisplay";
import { normalizeRecord } from "@/lib/records/normalize";
import { hashNormalizedRecord } from "@/lib/records/hash";
import { CAREPROOF_REGISTRY_ABI } from "@/lib/blockchain/contractAbi";
import type { CareRecord, VerificationResult, VerificationStatus } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { useWalletState } from "@/hooks/useWalletState";

interface VerificationPanelProps {
  record: CareRecord;
  onVerified?: (result: VerificationResult) => void;
}

const statusBadge: Record<VerificationStatus, { label: string; variant: "success" | "error" | "warning" | "neutral" | "info" | "default" }> = {
  verified:           { label: "Verified ✓",        variant: "success" },
  modified:           { label: "Modified ✗",         variant: "error"   },
  not_registered:     { label: "Not Registered",     variant: "neutral" },
  deactivated:        { label: "Deactivated",        variant: "warning" },
  verification_error: { label: "Verification Error", variant: "error"   },
  not_verified:       { label: "Not Verified",       variant: "neutral" },
};

export function VerificationPanel({ record, onVerified }: VerificationPanelProps) {
  const [result, setResult]   = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const publicClient          = usePublicClient();
  const { address }           = useWalletState();

  const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "") as `0x${string}`;

  const verify = async () => {
    if (!publicClient || !record.blockchainRecordId) return;
    setLoading(true);

    try {
      // 1. Compute local hash from current record data
      const normalized = normalizeRecord({
        title:             record.title,
        category:          record.category,
        providerName:      record.providerName,
        serviceDate:       record.serviceDate,
        description:       record.description,
        externalReference: record.externalReference,
        ownerAddress:      record.ownerAddress,
      });
      const localHash = hashNormalizedRecord(normalized);

      // 2. Read on-chain record
      const onChainData = await publicClient.readContract({
        address:      contractAddress,
        abi:          CAREPROOF_REGISTRY_ABI,
        functionName: "getRecord",
        args:         [BigInt(record.blockchainRecordId)],
      }) as readonly [string, string, string, bigint, boolean];

      const onChainHash  = onChainData[0] as `0x${string}`;
      const isActive     = onChainData[4];

      // 3. Determine status
      let status: VerificationStatus;
      if (!isActive) {
        status = "deactivated";
      } else if (localHash.toLowerCase() === onChainHash.toLowerCase()) {
        status = "verified";
      } else {
        status = "modified";
      }

      const verificationResult: VerificationResult = {
        status,
        localHash,
        onChainHash,
        isActive,
        verifiedAt:        new Date().toISOString(),
        verifierAddress:   address,
      };

      setResult(verificationResult);
      onVerified?.(verificationResult);
    } catch {
      const errorResult: VerificationResult = {
        status:       "verification_error",
        localHash:    record.dataHash as `0x${string}`,
        verifiedAt:   new Date().toISOString(),
        verifierAddress: address,
      };
      setResult(errorResult);
    } finally {
      setLoading(false);
    }
  };

  const canVerify = !!record.blockchainRecordId && !!contractAddress;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-gray-900">Record Verification</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Local hash */}
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">Local Hash</p>
          <HashDisplay hash={record.dataHash} label="local hash" truncate={false} />
        </div>

        {/* On-chain hash (after verification) */}
        {result?.onChainHash && (
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">On-Chain Hash</p>
            <HashDisplay hash={result.onChainHash} label="on-chain hash" truncate={false} />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={statusBadge[result.status].variant}>
                {statusBadge[result.status].label}
              </Badge>
            </div>
            {result.status === "verified" && (
              <p className="text-xs text-green-700">
                The local record matches the registered on-chain hash.
              </p>
            )}
            {result.status === "modified" && (
              <p className="text-xs text-red-700">
                The local record no longer matches the registered hash. The data may have been changed after blockchain registration.
              </p>
            )}
            {result.status === "deactivated" && (
              <p className="text-xs text-yellow-700">
                This blockchain record is deactivated. The historical hash is preserved.
              </p>
            )}
            {result.status === "verification_error" && (
              <p className="text-xs text-red-700">
                Could not read from the blockchain. Ensure the local Hardhat node is running and the contract is deployed.
              </p>
            )}
            <div className="text-xs text-gray-500 space-y-0.5 border-t pt-2">
              <p>Verified: {formatDateTime(result.verifiedAt)}</p>
              {result.verifierAddress && (
                <p className="font-mono">Verifier: {result.verifierAddress.slice(0, 10)}…{result.verifierAddress.slice(-6)}</p>
              )}
            </div>
          </div>
        )}

        {!canVerify && (
          <p className="text-xs text-gray-500">
            {!record.blockchainRecordId
              ? "This record has not been registered on the blockchain yet."
              : "Contract address not configured."}
          </p>
        )}

        <Button
          className="w-full"
          variant={result?.status === "verified" ? "secondary" : "primary"}
          onClick={verify}
          loading={loading}
          disabled={!canVerify}
        >
          {loading ? "Verifying…" : result ? "Re-verify" : "Verify Integrity"}
        </Button>
      </CardContent>
    </Card>
  );
}
