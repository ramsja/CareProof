import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export const metadata: Metadata = { title: "About CareProof" };

export default function AboutPage() {
  return (
    <div className="relative">
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">About CareProof</h1>
          <p className="mt-2 text-base text-gray-600">
            Your personal health records — organized, protected, and verifiable.
          </p>
        </div>

      {/* What is CareProof */}
      <Card>
        <CardHeader><h2 className="text-sm font-semibold text-gray-900">What is CareProof?</h2></CardHeader>
        <CardContent className="prose prose-sm text-gray-600 max-w-none space-y-2">
          <p>
            CareProof is a personal health record management app that lets you store, protect, and share
            your medical records — with built-in proof that your records have never been altered.
          </p>
          <p>
            Think of it as a secure digital filing cabinet for your health history, where every document
            comes with a tamper-evident seal. You stay in full control of what you store and who can see it.
          </p>
        </CardContent>
      </Card>

      {/* Your Records, Organized */}
      <Card>
        <CardHeader><h2 className="text-sm font-semibold text-gray-900">Your Records, Organized</h2></CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>
            Keep all your medical documents in one place. Each record captures the provider name,
            service date, a description of the visit or procedure, and an optional reference number
            from the provider. Records are organized into categories so you can find what you need quickly.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              "Check-up",
              "Laboratory",
              "Prescription",
              "Vaccination",
              "Consultation",
              "Insurance",
              "Certificate",
              "Other",
            ].map((cat) => (
              <div
                key={cat}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 text-center"
              >
                {cat}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tamper-Evident Proof */}
      <Card>
        <CardHeader><h2 className="text-sm font-semibold text-gray-900">Proof That Your Records Are Genuine</h2></CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <p>
            When you save a record, CareProof generates a unique digital fingerprint and registers it
            on a blockchain. If anyone ever questions whether a record is genuine and unmodified,
            you can verify it instantly — the app will tell you clearly.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                label: "Verified ✓",
                color: "border-green-200 bg-green-50",
                labelColor: "text-green-800",
                desc: "The record matches exactly what was originally registered. Nothing has changed.",
                descColor: "text-green-700",
              },
              {
                label: "Modified ✗",
                color: "border-red-200 bg-red-50",
                labelColor: "text-red-800",
                desc: "The record no longer matches the original. It may have been edited after registration.",
                descColor: "text-red-700",
              },
              {
                label: "Deactivated",
                color: "border-yellow-200 bg-yellow-50",
                labelColor: "text-yellow-800",
                desc: "The record has been marked inactive. Its original registration history is still preserved.",
                descColor: "text-yellow-700",
              },
            ].map(({ label, color, labelColor, desc, descColor }) => (
              <div key={label} className={`rounded-lg border p-4 ${color}`}>
                <p className={`text-xs font-semibold mb-1 ${labelColor}`}>{label}</p>
                <p className={`text-xs ${descColor}`}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-800 mb-2 text-xs">What stays private (on your device)</h3>
              <ul className="space-y-1 text-xs text-blue-700 list-disc list-inside">
                <li>Record title and description</li>
                <li>Provider name and category</li>
                <li>Service date</li>
                <li>External reference number</li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-800 mb-2 text-xs">What gets registered (on the blockchain)</h3>
              <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>A unique digital fingerprint of the record</li>
                <li>Your wallet address as the owner</li>
                <li>The date and time of registration</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Your personal health information is never published to the blockchain. Only the fingerprint goes on-chain,
            so your privacy is protected while the authenticity of your records remains publicly verifiable.
          </p>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader><h2 className="text-sm font-semibold text-gray-900">Control Who Can See Your Records</h2></CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>
            You decide who has access to each record. You can grant a specific person — such as a doctor,
            insurer, or family member — permission to view a record, and revoke that permission at any time.
            No one can access your records without your explicit approval.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-xs font-semibold text-green-800 mb-1">Grant Access</p>
              <p className="text-xs text-green-700">
                Share a record with anyone by entering their wallet address. They gain view access immediately.
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold text-red-800 mb-1">Revoke Access</p>
              <p className="text-xs text-red-700">
                Changed your mind? Remove someone's access at any time. The change takes effect on the blockchain right away.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drafts */}
      <Card>
        <CardHeader><h2 className="text-sm font-semibold text-gray-900">Save Now, Register Later</h2></CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            Not ready to register a record on the blockchain yet? Save it as a draft first.
            Drafts are stored privately on your device so you can review the details, make
            corrections, and register whenever you're ready.
          </p>
          <p>
            When you do decide to register, the app shows you a clear preview of exactly what
            will be fingerprinted — so you always know what you're committing to before confirming.
          </p>
        </CardContent>
      </Card>

      {/* Activity History */}
      <Card>
        <CardHeader><h2 className="text-sm font-semibold text-gray-900">A Full History of Every Action</h2></CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            CareProof keeps a complete activity log for every record. You can always look back
            and see exactly what happened and when — giving you full transparency and peace of mind.
          </p>
          <ul className="space-y-1 text-xs list-disc list-inside text-gray-500 pt-1">
            <li>Record created or registered on the blockchain</li>
            <li>Access granted to another person</li>
            <li>Access revoked</li>
            <li>Record integrity verified</li>
            <li>Record deactivated</li>
          </ul>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
