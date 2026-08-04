"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import type { EnvironmentHealth, HealthStatus } from "@/types";
import { useWalletState } from "@/hooks/useWalletState";

const HEALTH_ROWS: { key: keyof EnvironmentHealth; label: string }[] = [
  { key: "application",   label: "Application"   },
  { key: "database",      label: "Database"       },
  { key: "blockchainRpc", label: "Blockchain RPC" },
  { key: "smartContract", label: "Smart Contract" },
  { key: "wallet",        label: "Wallet"         },
  { key: "network",       label: "Network"        },
];

export function EnvironmentHealthPanel() {
  const [health, setHealth]   = useState<EnvironmentHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const { status, isCorrectNetwork } = useWalletState();

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => { if (j.success) setHealth(j.data.health); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Augment wallet + network status from client-side wallet state
  const merged: EnvironmentHealth | null = health
    ? {
        ...health,
        wallet:  status === "connected" ? "connected" : status === "no_wallet" ? "unavailable" : "disconnected",
        network: status === "connected" && isCorrectNetwork ? "connected" : status === "wrong_network" ? "wrong_network" : "disconnected",
      }
    : null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-gray-900">Environment</h2>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-gray-400 animate-pulse">Checking…</p>
        ) : merged ? (
          <div className="space-y-2">
            {HEALTH_ROWS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{label}</span>
                <StatusDot status={merged[key] as HealthStatus} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-red-500">Could not fetch health status.</p>
        )}
      </CardContent>
    </Card>
  );
}
