"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HashDisplay } from "@/components/ui/HashDisplay";
import { VerificationPanel } from "@/components/blockchain/VerificationPanel";
import { AccessManager } from "@/components/blockchain/AccessManager";
import { ActivityLog } from "@/components/records/ActivityLog";
import { Tabs, TabList, TabTrigger, TabPanel } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { formatDate, formatDateTime, truncateAddress } from "@/lib/utils";
import {
  BLOCKCHAIN_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  RECORD_CATEGORIES,
  type CareRecord,
  type ActivityEntry,
} from "@/types";

export default function RecordDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [record,     setRecord]     = useState<(CareRecord & { activities?: ActivityEntry[] }) | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);

  const fetchRecord = useCallback(async () => {
    try {
      const res  = await fetch(`/api/records/${id}`);
      const json = await res.json();
      if (!json.success) { setNotFound(true); return; }
      setRecord(json.data);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  if (loading) return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="h-8 w-48 rounded bg-gray-200 animate-pulse mb-4" />
      <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
    </div>
  );

  if (notFound || !record) return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Record not found</h1>
      <p className="mt-2 text-sm text-gray-500">The requested record does not exist or has been removed.</p>
      <Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard")}>← Dashboard</Button>
    </div>
  );

  const categoryLabel = RECORD_CATEGORIES.find((c) => c.value === record.category)?.label ?? record.category;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="mb-2 text-xs text-blue-600 hover:underline focus-visible:outline-none">← Back</button>
          <h1 className="text-2xl font-bold text-gray-900">{record.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{record.providerName} · {formatDate(record.serviceDate)}</p>
          {record.deactivated && (
            <Badge variant="warning" className="mt-2">Deactivated</Badge>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="info">{categoryLabel}</Badge>
          <Badge variant={record.blockchainStatus === "confirmed" ? "success" : record.blockchainStatus === "failed" ? "error" : "neutral"}>
            {BLOCKCHAIN_STATUS_LABELS[record.blockchainStatus]}
          </Badge>
          <Badge variant={record.verificationStatus === "verified" ? "success" : record.verificationStatus === "modified" ? "error" : "neutral"}>
            {VERIFICATION_STATUS_LABELS[record.verificationStatus]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          <Tabs defaultTab="details">
            <TabList>
              <TabTrigger id="details">Details</TabTrigger>
              <TabTrigger id="blockchain">Blockchain</TabTrigger>
              <TabTrigger id="activity">Activity</TabTrigger>
            </TabList>

            {/* Details tab */}
            <TabPanel id="details" className="pt-4">
              <Card>
                <CardContent className="divide-y divide-gray-100">
                  {[
                    { label: "Title",      value: record.title },
                    { label: "Category",   value: categoryLabel },
                    { label: "Provider",   value: record.providerName },
                    { label: "Date",       value: formatDate(record.serviceDate) },
                    { label: "Description", value: record.description },
                    ...(record.externalReference ? [{ label: "Reference", value: record.externalReference }] : []),
                    { label: "Created",    value: formatDateTime(record.createdAt) },
                    { label: "Updated",    value: formatDateTime(record.updatedAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-4 py-3">
                      <span className="w-28 flex-shrink-0 text-xs font-medium text-gray-500">{label}</span>
                      <span className="text-sm text-gray-800 break-words">{value}</span>
                    </div>
                  ))}
                  <div className="flex gap-4 py-3">
                    <span className="w-28 flex-shrink-0 text-xs font-medium text-gray-500">Owner</span>
                    <div className="flex items-center gap-1">
                      <code className="font-mono text-xs text-gray-700">{truncateAddress(record.ownerAddress, 8)}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Blockchain tab */}
            <TabPanel id="blockchain" className="pt-4">
              <Card>
                <CardContent className="divide-y divide-gray-100">
                  <div className="flex gap-4 py-3">
                    <span className="w-36 flex-shrink-0 text-xs font-medium text-gray-500">Local Hash</span>
                    <HashDisplay hash={record.dataHash} label="local hash" truncate={false} />
                  </div>
                  {record.blockchainRecordId && (
                    <div className="flex gap-4 py-3">
                      <span className="w-36 flex-shrink-0 text-xs font-medium text-gray-500">Chain Record ID</span>
                      <span className="font-mono text-sm text-gray-800">#{record.blockchainRecordId}</span>
                    </div>
                  )}
                  {record.transactionHash && (
                    <div className="flex gap-4 py-3">
                      <span className="w-36 flex-shrink-0 text-xs font-medium text-gray-500">Transaction</span>
                      <HashDisplay hash={record.transactionHash as `0x${string}`} label="tx hash" truncate={false} />
                    </div>
                  )}
                  {record.blockNumber && (
                    <div className="flex gap-4 py-3">
                      <span className="w-36 flex-shrink-0 text-xs font-medium text-gray-500">Block</span>
                      <span className="font-mono text-sm text-gray-800">#{record.blockNumber}</span>
                    </div>
                  )}
                  {record.confirmationTime && (
                    <div className="flex gap-4 py-3">
                      <span className="w-36 flex-shrink-0 text-xs font-medium text-gray-500">Confirmed At</span>
                      <span className="text-sm text-gray-800">{formatDateTime(record.confirmationTime)}</span>
                    </div>
                  )}
                  <div className="flex gap-4 py-3">
                    <span className="w-36 flex-shrink-0 text-xs font-medium text-gray-500">Owner</span>
                    <code className="font-mono text-xs text-gray-700">{record.ownerAddress}</code>
                  </div>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Activity tab */}
            <TabPanel id="activity" className="pt-4">
              <Card>
                <CardContent>
                  <ActivityLog
                    activities={record.activities ?? []}
                    emptyMessage="No blockchain activity recorded yet."
                  />
                </CardContent>
              </Card>
            </TabPanel>
          </Tabs>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4">
          <VerificationPanel record={record} onVerified={() => fetchRecord()} />
          <AccessManager record={record} onActivityLogged={() => fetchRecord()} />
        </aside>
      </div>
    </div>
  );
}
