import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

interface HashDisplayProps {
  hash: string;
  label?: string;
  truncate?: boolean;
  className?: string;
}

export function HashDisplay({ hash, label, truncate = true, className }: HashDisplayProps) {
  const display = truncate && hash.length > 20
    ? `${hash.slice(0, 10)}…${hash.slice(-8)}`
    : hash;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <code
        className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700 break-all"
        title={hash}
      >
        {display}
      </code>
      <CopyButton value={hash} label={label ?? "hash"} />
    </span>
  );
}
