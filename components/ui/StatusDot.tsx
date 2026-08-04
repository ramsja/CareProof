import { cn } from "@/lib/utils";
import type { HealthStatus } from "@/types";

const statusColors: Record<HealthStatus, string> = {
  ready:         "bg-green-500",
  connected:     "bg-green-500",
  disconnected:  "bg-gray-400",
  wrong_network: "bg-yellow-500",
  unavailable:   "bg-red-500",
  not_deployed:  "bg-orange-400",
  error:         "bg-red-500",
};

const statusLabels: Record<HealthStatus, string> = {
  ready:         "Ready",
  connected:     "Connected",
  disconnected:  "Disconnected",
  wrong_network: "Wrong Network",
  unavailable:   "Unavailable",
  not_deployed:  "Not Deployed",
  error:         "Error",
};

interface StatusDotProps {
  status: HealthStatus;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function StatusDot({ status, label, showLabel = true, className }: StatusDotProps) {
  const displayLabel = label ?? statusLabels[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn("h-2 w-2 rounded-full flex-shrink-0", statusColors[status])}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-sm text-gray-600">{displayLabel}</span>
      )}
    </span>
  );
}
