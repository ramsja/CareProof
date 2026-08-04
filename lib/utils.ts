import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Truncate an EVM address for display: 0x1234…abcd */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/** Format a bigint or string block number */
export function formatBlockNumber(blockNumber: string | bigint | undefined): string {
  if (blockNumber === undefined) return "—";
  return `#${blockNumber.toString()}`;
}

/** Format an ISO date string to a readable local date */
export function formatDate(iso: string | Date | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format an ISO datetime string to a readable local datetime */
export function formatDateTime(iso: string | Date | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Returns true if the string is a valid EVM address */
export function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/** Returns a safe API error response body */
export function apiError(code: string, message: string, status = 400) {
  return { success: false, error: { code, message } };
}
