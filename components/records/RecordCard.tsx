import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate, truncateAddress } from "@/lib/utils";
import {
  BLOCKCHAIN_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  RECORD_CATEGORIES,
  type CareRecord,
  type BlockchainStatus,
  type VerificationStatus,
} from "@/types";

const blockchainVariant: Record<BlockchainStatus, "success" | "warning" | "error" | "neutral" | "info" | "default"> = {
  draft:              "neutral",
  awaiting_signature: "warning",
  submitted:          "info",
  pending:            "warning",
  confirmed:          "success",
  rejected:           "error",
  reverted:           "error",
  failed:             "error",
};

const verificationVariant: Record<VerificationStatus, "success" | "warning" | "error" | "neutral" | "info" | "default"> = {
  not_verified:       "neutral",
  verified:           "success",
  modified:           "error",
  not_registered:     "neutral",
  deactivated:        "warning",
  verification_error: "error",
};

interface RecordCardProps {
  record: CareRecord;
}

export function RecordCard({ record }: RecordCardProps) {
  const categoryLabel =
    RECORD_CATEGORIES.find((c) => c.value === record.category)?.label ?? record.category;

  return (
    <Link href={`/records/${record.id}`} className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {record.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {record.providerName} · {formatDate(record.serviceDate)}
              </p>
              <p className="mt-0.5 font-mono text-xs text-gray-400">
                {truncateAddress(record.ownerAddress, 4)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Badge variant="info">{categoryLabel}</Badge>
              <Badge variant={blockchainVariant[record.blockchainStatus]}>
                {BLOCKCHAIN_STATUS_LABELS[record.blockchainStatus]}
              </Badge>
              <Badge variant={verificationVariant[record.verificationStatus]}>
                {VERIFICATION_STATUS_LABELS[record.verificationStatus]}
              </Badge>
            </div>
          </div>
          {record.deactivated && (
            <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1">
              Deactivated — on-chain history preserved
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
