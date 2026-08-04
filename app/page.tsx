import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CareProof — Blockchain Record Integrity and Access Portal",
};

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Connect Your Wallet",
    desc: "Connect a MetaMask-compatible wallet. Your wallet address acts as your identity — no username or password required.",
  },
  {
    step: "02",
    title: "Create a Record",
    desc: "Enter healthcare record details. CareProof normalises the data and generates a deterministic keccak256 hash.",
  },
  {
    step: "03",
    title: "Register on Blockchain",
    desc: "Approve a transaction to register the record hash in the CareProofRegistry smart contract. Only the hash is stored on-chain.",
  },
  {
    step: "04",
    title: "Verify Integrity",
    desc: "At any time, compare the local record hash with the on-chain registered hash to confirm the data has not been modified.",
  },
  {
    step: "05",
    title: "Manage Access",
    desc: "Grant another wallet address read access to your record. Revoke access or deactivate the record at any time.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden />
          TechHavenLabs · Evaluation Network
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          CareProof
        </h1>
        <p className="mt-3 text-lg text-gray-500 font-medium">
          Blockchain Record Integrity and Access Portal
        </p>
        <p className="mt-4 mx-auto max-w-2xl text-base text-gray-600">
          Register healthcare record hashes on a local Ethereum blockchain. Verify data
          integrity, manage wallet-based access, and maintain a tamper-evident audit trail —
          all without storing personal health information on-chain.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Open Dashboard
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Key facts */}
      <section className="border-y border-gray-100 bg-white/40 py-10" aria-label="Key facts">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
            {[
              { value: "On-Chain",   label: "Hash only — no personal data stored on blockchain" },
              { value: "Local",      label: "Runs entirely on your machine — no cloud required"  },
              { value: "Wallet",     label: "Your wallet address is your identity"               },
              { value: "Open",       label: "Fictional records — evaluation and development use" },
            ].map(({ value, label }) => (
              <div key={value}>
                <p className="text-2xl font-bold text-blue-600">{value}</p>
                <p className="mt-1 text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="workflow-heading">
        <h2 id="workflow-heading" className="text-2xl font-bold text-gray-900 text-center mb-10">
          How It Works
        </h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOW_STEPS.map(({ step, title, desc }) => (
            <li key={step} className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <span className="text-3xl font-bold text-blue-100">{step}</span>
              <h3 className="mt-2 text-base font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Network info */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6" aria-labelledby="network-heading">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 id="network-heading" className="text-base font-semibold text-blue-900 mb-3">
            Supported Network
          </h2>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            {[
              { label: "Network Name", value: "CareProof Local" },
              { label: "Chain ID",     value: "31337"           },
              { label: "RPC URL",      value: "http://127.0.0.1:8545" },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-xs font-medium text-blue-700">{label}</span>
                <p className="font-mono text-blue-900">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-blue-700">
            This is a local Hardhat development network. Use the &quot;Add Network&quot; action in the
            dashboard to configure your wallet automatically.
          </p>
        </div>
      </section>

      {/* Privacy notice */}
      <section className="border-t border-gray-100 bg-white/40 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Privacy Model</h2>
          <p className="text-xs text-gray-500">
            CareProof stores only the cryptographic hash of your record on the blockchain — not the
            record content itself. Descriptive record data is stored locally in a SQLite database on
            your machine. This application uses fictional sample records and is intended for evaluation only. It does not claim HIPAA compliance or medical-grade
            security.
          </p>
        </div>
      </section>
    </div>
  );
}
