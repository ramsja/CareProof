"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useWalletState } from "@/hooks/useWalletState";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { EnvironmentHealthPanel } from "@/components/blockchain/EnvironmentHealth";
import { RecordCard } from "@/components/records/RecordCard";
import { RecordFilters } from "@/components/records/RecordFilters";
import { ActivityLog } from "@/components/records/ActivityLog";
import { Tabs, TabList, TabTrigger, TabPanel } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import type { CareRecord, ActivityEntry } from "@/types";

export default function DashboardPage() {
  const { address, status } = useWalletState();

  const [ownedRecords,  setOwnedRecords]  = useState<CareRecord[]>([]);
  const [sharedRecords, setSharedRecords] = useState<CareRecord[]>([]);
  const [activities,    setActivities]    = useState<ActivityEntry[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [filters, setFilters] = useState({
    search: "", category: "", blockchainStatus: "", verificationStatus: "",
  });

  const fetchData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ wallet: address });
      if (filters.category)           params.set("category",           filters.category);
      if (filters.blockchainStatus)   params.set("blockchainStatus",   filters.blockchainStatus);
      if (filters.verificationStatus) params.set("verificationStatus", filters.verificationStatus);
      if (filters.search)             params.set("search",             filters.search);

      const [recRes, actRes] = await Promise.all([
        fetch(`/api/records?${params}`).then((r) => r.json()),
        fetch(`/api/activity?wallet=${address}&limit=20`).then((r) => r.json()),
      ]);

      if (recRes.success) setOwnedRecords(recRes.data);
      if (actRes.success) setActivities(actRes.data);
    } catch { /* silently handle */ }
    finally { setLoading(false); }
  }, [address, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = {
    total:     ownedRecords.length,
    confirmed: ownedRecords.filter((r) => r.blockchainStatus === "confirmed").length,
    verified:  ownedRecords.filter((r) => r.verificationStatus === "verified").length,
    drafts:    ownedRecords.filter((r) => r.blockchainStatus === "draft").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {address
              ? `Connected: ${address.slice(0, 10)}…${address.slice(-6)}`
              : "Connect your wallet to view your records"}
          </p>
        </div>
        <Link href="/records/new">
          <Button>+ New Record</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left sidebar */}
        <aside className="space-y-4">
          <WalletPanel />
          <EnvironmentHealthPanel />

          {/* Stats */}
          {status === "connected" && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Record Statistics</h2>
              <dl className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total",     value: stats.total     },
                  { label: "On-Chain",  value: stats.confirmed },
                  { label: "Verified",  value: stats.verified  },
                  { label: "Drafts",    value: stats.drafts    },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-gray-50 p-3">
                    <dt className="text-xs text-gray-500">{label}</dt>
                    <dd className="text-xl font-bold text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="space-y-6">
          {status !== "connected" ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Connect your wallet</h2>
              <p className="mt-1 text-sm text-gray-500">
                Your wallet address is used to load your records and sign transactions.
              </p>
            </div>
          ) : (
            <Tabs defaultTab="owned">
              <TabList>
                <TabTrigger id="owned">My Records ({stats.total})</TabTrigger>
                <TabTrigger id="shared">Shared With Me ({sharedRecords.length})</TabTrigger>
                <TabTrigger id="activity">Recent Activity ({activities.length})</TabTrigger>
              </TabList>

              <TabPanel id="owned" className="pt-4 space-y-4">
                <RecordFilters {...filters} onChange={setFilters} />

                {loading ? (
                  <RecordsLoading />
                ) : ownedRecords.length === 0 ? (
                  <EmptyState
                    title="No records yet"
                    description="Create your first record to get started."
                    action={{ href: "/records/new", label: "Create Record" }}
                  />
                ) : (
                  <div className="grid gap-3">
                    {ownedRecords.map((r) => <RecordCard key={r.id} record={r} />)}
                  </div>
                )}
              </TabPanel>

              <TabPanel id="shared" className="pt-4">
                {sharedRecords.length === 0 ? (
                  <EmptyState
                    title="No shared records"
                    description="Records shared with your wallet address will appear here."
                  />
                ) : (
                  <div className="grid gap-3">
                    {sharedRecords.map((r) => <RecordCard key={r.id} record={r} />)}
                  </div>
                )}
              </TabPanel>

              <TabPanel id="activity" className="pt-4">
                <ActivityLog activities={activities} emptyMessage="No recent activity for this wallet." />
              </TabPanel>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}

function RecordsLoading() {
  return (
    <div className="space-y-3" aria-label="Loading records" aria-busy="true">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
      <p className="font-medium text-gray-700">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
      {action && (
        <Link href={action.href} className="mt-4 inline-block">
          <Button size="sm">{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
