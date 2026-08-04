"use client";
import { useEffect, useState, useCallback } from "react";
import { useWalletState } from "@/hooks/useWalletState";
import { ActivityLog } from "@/components/records/ActivityLog";
import { Input, Select } from "@/components/ui/FormField";
import type { ActivityEntry } from "@/types";

const EVENT_NAMES = ["RecordRegistered", "AccessGranted", "AccessRevoked", "RecordDeactivated"];

export default function ActivityPage() {
  const { address } = useWalletState();
  const [activities,  setActivities]  = useState<ActivityEntry[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [walletFilter, setWalletFilter] = useState("");
  const [eventFilter,  setEventFilter]  = useState("");
  const [recordFilter, setRecordFilter] = useState("");

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      const wallet = walletFilter || address;
      if (wallet)       params.set("wallet",    wallet);
      if (eventFilter)  params.set("eventName", eventFilter);
      if (recordFilter) params.set("recordId",  recordFilter);

      const res  = await fetch(`/api/activity?${params}`);
      const json = await res.json();
      if (json.success) setActivities(json.data);
    } catch { /* silently handle */ }
    finally { setLoading(false); }
  }, [address, walletFilter, eventFilter, recordFilter]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
        <p className="mt-1 text-sm text-gray-500">
          Decoded blockchain events for CareProof records.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2" role="search" aria-label="Filter activity">
        <Input
          placeholder="Wallet address (0x…)"
          value={walletFilter}
          onChange={(e) => setWalletFilter(e.target.value)}
          className="w-56 font-mono text-xs"
          aria-label="Filter by wallet address"
        />
        <Select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="w-48"
          aria-label="Filter by event"
        >
          <option value="">All events</option>
          {EVENT_NAMES.map((e) => <option key={e} value={e}>{e}</option>)}
        </Select>
        <Input
          placeholder="Record ID…"
          value={recordFilter}
          onChange={(e) => setRecordFilter(e.target.value)}
          className="w-40"
          aria-label="Filter by record ID"
        />
      </div>

      {/* Results */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="space-y-3" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <ActivityLog
            activities={activities}
            emptyMessage="No activity found for the selected filters."
          />
        )}
      </div>
    </div>
  );
}
