"use client";
import { cn } from "@/lib/utils";
import { HashDisplay } from "@/components/ui/HashDisplay";
import { Badge } from "@/components/ui/Badge";
import { transactionStateMessage } from "@/lib/blockchain/errors";
import type { TransactionState, DecodedContractEvent } from "@/types";
import type { TransactionReceipt } from "viem";
import { formatEventTimestamp } from "@/lib/blockchain/eventDecoder";

interface TransactionStatusProps {
  state: TransactionState;
  txHash?: `0x${string}`;
  receipt?: TransactionReceipt;
  decodedEvents?: DecodedContractEvent[];
  errorMessage?: string;
  className?: string;
}

const stateBadge: Record<TransactionState, { label: string; variant: "default" | "success" | "warning" | "error" | "info" | "neutral" }> = {
  idle:               { label: "Ready",            variant: "neutral"  },
  awaiting_signature: { label: "Awaiting Wallet",  variant: "warning"  },
  submitted:          { label: "Submitted",         variant: "info"     },
  pending:            { label: "Confirming…",       variant: "warning"  },
  confirmed:          { label: "Confirmed",         variant: "success"  },
  rejected:           { label: "Rejected",          variant: "error"    },
  reverted:           { label: "Reverted",          variant: "error"    },
  failed:             { label: "Failed",            variant: "error"    },
};

export function TransactionStatus({
  state,
  txHash,
  receipt,
  decodedEvents,
  errorMessage,
  className,
}: TransactionStatusProps) {
  if (state === "idle") return null;

  const badge = stateBadge[state];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-lg border p-4 space-y-3",
        state === "confirmed" ? "border-green-200 bg-green-50"   :
        ["rejected","reverted","failed"].includes(state) ? "border-red-200 bg-red-50" :
        "border-blue-200 bg-blue-50",
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        {["awaiting_signature","submitted","pending"].includes(state) && (
          <svg className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        )}
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <p className="text-sm text-gray-700">{transactionStateMessage(state)}</p>
      </div>

      {/* Error */}
      {errorMessage && (
        <p className="text-sm text-red-700">{errorMessage}</p>
      )}

      {/* Transaction details */}
      {txHash && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600">Transaction Hash</p>
          <HashDisplay hash={txHash} label="tx hash" truncate={false} />
        </div>
      )}

      {receipt && (
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Block</span>
            <p className="font-mono">#{receipt.blockNumber.toString()}</p>
          </div>
          <div>
            <span className="font-medium">Status</span>
            <p className="capitalize">{receipt.status}</p>
          </div>
        </div>
      )}

      {/* Decoded events */}
      {decodedEvents && decodedEvents.length > 0 && (
        <div className="space-y-2 border-t border-green-200 pt-3">
          <p className="text-xs font-semibold text-gray-700">Decoded Events</p>
          {decodedEvents.map((evt, i) => (
            <DecodedEventCard key={i} event={evt} />
          ))}
        </div>
      )}
    </div>
  );
}

function DecodedEventCard({ event }: { event: DecodedContractEvent }) {
  return (
    <div className="rounded border border-green-200 bg-white p-3 space-y-1.5">
      <p className="text-xs font-semibold text-green-800">{event.eventName}</p>
      <div className="grid gap-1 text-xs text-gray-600">
        <Row label="Record ID"  value={event.recordId.toString()} mono />
        {"dataHash" in event && <Row label="Hash"       value={event.dataHash}    mono truncate />}
        {"owner"    in event && <Row label="Owner"      value={event.owner}       mono truncate />}
        {"creator"  in event && <Row label="Creator"    value={event.creator}     mono truncate />}
        {"viewer"   in event && <Row label="Viewer"     value={event.viewer}      mono truncate />}
        <Row label="Timestamp"  value={formatEventTimestamp(event.timestamp)} />
        <Row label="Tx Hash"    value={event.transactionHash} mono truncate />
        <Row label="Block"      value={`#${event.blockNumber.toString()}`} mono />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  const display = truncate && value.length > 26
    ? `${value.slice(0, 10)}…${value.slice(-8)}`
    : value;
  return (
    <div className="flex gap-2">
      <span className="w-20 flex-shrink-0 text-gray-500">{label}</span>
      <span
        className={cn(mono && "font-mono break-all")}
        title={truncate ? value : undefined}
      >
        {display}
      </span>
    </div>
  );
}
