"use client";
/**
 * Client-side providers wrapper.
 * Wagmi + TanStack Query must be client components — all pages stay server-first
 * by rendering children through this boundary.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState } from "react";
import { careproofLocal } from "@/lib/blockchain/network";

function makeWagmiConfig() {
  return createConfig({
    chains: [careproofLocal],
    connectors: [
      injected({ target: "metaMask" }),
      injected(), // generic injected (catches Brave Wallet, etc.)
    ],
    transports: {
      [careproofLocal.id]: http(
        process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545",
      ),
    },
    ssr: true,
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Create stable instances once — avoids re-creation on every render
  const [wagmiConfig] = useState(() => makeWagmiConfig());
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
