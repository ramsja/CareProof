import { Badge } from "@/components/ui/Badge";
import { HashDisplay } from "@/components/ui/HashDisplay";
import { formatDateTime, truncateAddress } from "@/lib/utils";
import type { ActivityEntry } from "@/types";

const eventVariant: Record<string, "success" | "warning" | "error" | "info" | "neutral" | "default"> = {
  RecordRegistered:  "success",
  AccessGranted:     "info",
  AccessRevoked:     "warning",
  RecordDeactivated: "error",
};

interface ActivityLogProps {
  activities: ActivityEntry[];
  emptyMessage?: string;
}

export function ActivityLog({ activities, emptyMessage = "No activity yet." }: ActivityLogProps) {
  if (activities.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">{emptyMessage}</p>;
  }

  return (
    <ol className="space-y-3" aria-label="Activity log">
      {activities.map((entry) => (
        <li key={entry.id} className="flex gap-3">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" aria-hidden />
            <div className="w-px flex-1 bg-gray-200 mt-1" aria-hidden />
          </div>

          {/* Content */}
          <div className="pb-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={eventVariant[entry.eventName] ?? "neutral"}>
                {entry.eventName}
              </Badge>
              <time className="text-xs text-gray-400" dateTime={entry.timestamp}>
                {formatDateTime(entry.timestamp)}
              </time>
            </div>

            {entry.walletAddress && (
              <p className="mt-1 font-mono text-xs text-gray-500">
                Wallet: {truncateAddress(entry.walletAddress, 6)}
              </p>
            )}

            {entry.transactionHash && (
              <div className="mt-1">
                <HashDisplay hash={entry.transactionHash} label="tx hash" />
              </div>
            )}

            {entry.blockNumber && (
              <p className="mt-0.5 text-xs text-gray-400">Block #{entry.blockNumber}</p>
            )}

            {entry.eventArgs && Object.keys(entry.eventArgs).length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-xs text-blue-600 hover:underline">
                  Event arguments
                </summary>
                <pre className="mt-1 rounded bg-gray-50 p-2 text-xs overflow-x-auto text-gray-700 border border-gray-200">
                  {JSON.stringify(entry.eventArgs, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
