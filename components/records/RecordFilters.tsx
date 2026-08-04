"use client";
import { Select } from "@/components/ui/FormField";
import { Input } from "@/components/ui/FormField";
import { RECORD_CATEGORIES } from "@/types";

interface RecordFiltersProps {
  search:             string;
  category:           string;
  blockchainStatus:   string;
  verificationStatus: string;
  onChange: (filters: {
    search:             string;
    category:           string;
    blockchainStatus:   string;
    verificationStatus: string;
  }) => void;
}

export function RecordFilters({
  search,
  category,
  blockchainStatus,
  verificationStatus,
  onChange,
}: RecordFiltersProps) {
  const set = (key: string, value: string) =>
    onChange({ search, category, blockchainStatus, verificationStatus, [key]: value });

  return (
    <div className="flex flex-wrap gap-2" role="search" aria-label="Filter records">
      <Input
        placeholder="Search records…"
        value={search}
        onChange={(e) => set("search", e.target.value)}
        className="w-48"
        aria-label="Search records"
      />
      <Select
        value={category}
        onChange={(e) => set("category", e.target.value)}
        aria-label="Filter by category"
        className="w-40"
      >
        <option value="">All categories</option>
        {RECORD_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </Select>
      <Select
        value={blockchainStatus}
        onChange={(e) => set("blockchainStatus", e.target.value)}
        aria-label="Filter by blockchain status"
        className="w-44"
      >
        <option value="">All blockchain statuses</option>
        {["draft","confirmed","pending","failed"].map((s) => (
          <option key={s} value={s} className="capitalize">{s}</option>
        ))}
      </Select>
      <Select
        value={verificationStatus}
        onChange={(e) => set("verificationStatus", e.target.value)}
        aria-label="Filter by verification status"
        className="w-44"
      >
        <option value="">All verification statuses</option>
        {["not_verified","verified","modified","deactivated"].map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </Select>
    </div>
  );
}
