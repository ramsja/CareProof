import Link from "next/link";
import { WalletButton } from "@/components/wallet/WalletButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="leading-tight">
            <span className="block text-sm font-bold text-gray-900">CareProof</span>
            <span className="block text-xs text-gray-500">TechHavenLabs</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/records/new", label: "New Record" },
            { href: "/activity", label: "Activity" },
            { href: "/about", label: "About" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet */}
        <WalletButton />
      </div>
    </header>
  );
}
