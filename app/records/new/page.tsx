"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWalletState } from "@/hooks/useWalletState";
import { useTransaction } from "@/hooks/useTransaction";
import { normalizeRecord } from "@/lib/records/normalize";
import { hashNormalizedRecord } from "@/lib/records/hash";
import { createRecordSchema, type CreateRecordInput } from "@/lib/validation/schemas";
import { TransactionStatus } from "@/components/blockchain/TransactionStatus";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { FormField, Input, Textarea, Select } from "@/components/ui/FormField";
import { HashDisplay } from "@/components/ui/HashDisplay";
import { RECORD_CATEGORIES } from "@/types";

type Step = "form" | "preview" | "register" | "done";

export default function NewRecordPage() {
  const router   = useRouter();
  const { address, status, isCorrectNetwork } = useWalletState();
  const tx = useTransaction();
  const [step, setStep] = useState<Step>("form");
  const [savedId, setSavedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateRecordInput>({
    resolver: zodResolver(createRecordSchema),
    defaultValues: { ownerAddress: address ?? "", externalReference: "" },
  });

  const formValues = watch();

  // Compute preview hash whenever form values change
  const previewHash = (() => {
    try {
      const norm = normalizeRecord({ ...formValues, ownerAddress: formValues.ownerAddress ?? "" });
      return hashNormalizedRecord(norm);
    } catch { return null; }
  })();

  // Step 1: Save draft to DB
  const saveDraft = async (data: CreateRecordInput): Promise<string | null> => {
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Failed to save record");
    return json.data.id as string;
  };

  const onSubmit = (data: CreateRecordInput) => {
    void data;
    setStep("preview");
  };

  const handleSaveAndRegister = async () => {
    try {
      // 1. Save draft
      const id = await saveDraft(formValues as CreateRecordInput);
      if (!id) return;
      setSavedId(id);

      // 2. Register on blockchain
      setStep("register");
      const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "") as `0x${string}`;
      if (!contractAddress || !previewHash) return;

      const receipt = await tx.registerRecord(previewHash, formValues.ownerAddress as `0x${string}`);
      if (!receipt) return;

      // 3. Decode RecordRegistered event to get on-chain record ID
      const registeredEvent = tx.decodedEvents.find((e) => e.eventName === "RecordRegistered");
      const blockchainRecordId = registeredEvent && "recordId" in registeredEvent
        ? registeredEvent.recordId.toString()
        : undefined;

      // 4. Update DB with confirmed blockchain data
      await fetch(`/api/records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockchainStatus:    "confirmed",
          verificationStatus:  "verified",
          blockchainRecordId,
          transactionHash:     receipt.transactionHash,
          blockNumber:         receipt.blockNumber.toString(),
          confirmationTime:    new Date().toISOString(),
        }),
      });

      setStep("done");
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  const handleSaveDraftOnly = async () => {
    try {
      const id = await saveDraft(formValues as CreateRecordInput);
      if (id) router.push(`/records/${id}`);
    } catch { /* handled by form state */ }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Record</h1>
        <p className="mt-1 text-sm text-gray-500">
          Record details are stored locally. Only the cryptographic hash is registered on-chain.
        </p>
      </div>

      {/* Step: Form */}
      {step === "form" && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-900">Record Details</h2></CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Title" htmlFor="title" error={errors.title?.message} required>
                <Input id="title" {...register("title")} error={!!errors.title} placeholder="e.g. Annual Physical Examination" />
              </FormField>

              <FormField label="Category" htmlFor="category" error={errors.category?.message} required>
                <Select id="category" {...register("category")} error={!!errors.category}>
                  <option value="">Select a category</option>
                  {RECORD_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Provider / Organisation" htmlFor="provider" error={errors.providerName?.message} required>
                <Input id="provider" {...register("providerName")} error={!!errors.providerName} placeholder="e.g. Greenfield Medical Center" />
              </FormField>

              <FormField label="Service Date" htmlFor="date" error={errors.serviceDate?.message} required
                hint="Past dates only. Future service dates are not permitted.">
                <Input id="date" type="date" {...register("serviceDate")} error={!!errors.serviceDate} />
              </FormField>

              <FormField label="Description" htmlFor="desc" error={errors.description?.message} required>
                <Textarea id="desc" {...register("description")} error={!!errors.description} rows={3}
                  placeholder="Brief description of the record or service" />
              </FormField>

              <FormField label="External Reference" htmlFor="ref" error={errors.externalReference?.message}
                hint="Optional identifier from the provider (e.g. REF-1024)">
                <Input id="ref" {...register("externalReference")} placeholder="Optional" />
              </FormField>

              <FormField label="Owner Address" htmlFor="owner" error={errors.ownerAddress?.message} required
                hint="Defaults to your connected wallet address.">
                <Input id="owner" {...register("ownerAddress")} error={!!errors.ownerAddress}
                  className="font-mono text-xs" placeholder="0x…" />
              </FormField>
            </CardContent>
          </Card>

          {/* Live hash preview */}
          {previewHash && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-700 mb-1">Hash Preview</p>
              <p className="text-xs text-blue-600 mb-2">
                Generated deterministically from the normalised record data.
              </p>
              <HashDisplay hash={previewHash} label="preview hash" truncate={false} />
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={handleSaveDraftOnly}>Save Draft</Button>
            <Button type="submit">Preview & Register</Button>
          </div>
        </form>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="space-y-5">
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-900">Normalised Record Preview</h2></CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">
                This is the exact data that will be hashed. Verify it before registering.
              </p>
              {previewHash && (
                <div className="space-y-2">
                  <pre className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-xs overflow-x-auto text-gray-700">
                    {JSON.stringify(normalizeRecord({ ...formValues, ownerAddress: formValues.ownerAddress ?? "" }), null, 2)}
                  </pre>
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Deterministic Hash</p>
                    <HashDisplay hash={previewHash} label="record hash" truncate={false} />
                  </div>
                </div>
              )}
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
                Only this hash — not the record content — will be stored on the blockchain.
              </div>
            </CardContent>
          </Card>

          {/* Wallet requirements */}
          {status !== "connected" && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              Connect your wallet to register on the blockchain. You can still save a draft.
            </div>
          )}
          {status === "connected" && !isCorrectNetwork && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              Switch to CareProof Local (Chain ID 31337) to register.
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setStep("form")}>← Back</Button>
            <Button variant="secondary" onClick={handleSaveDraftOnly}>Save Draft Only</Button>
            <Button
              onClick={handleSaveAndRegister}
              disabled={status !== "connected" || !isCorrectNetwork || tx.isPending}
              loading={tx.isPending}
            >
              Save & Register on Blockchain
            </Button>
          </div>
        </div>
      )}

      {/* Step: Register (transaction in progress) */}
      {step === "register" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-900">Blockchain Registration</h2></CardHeader>
            <CardContent>
              <TransactionStatus
                state={tx.state}
                txHash={tx.txHash}
                receipt={tx.receipt}
                decodedEvents={tx.decodedEvents}
                errorMessage={tx.errorMessage}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && savedId && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center space-y-4">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-green-900">Record Registered</h2>
          <p className="text-sm text-green-700">
            The record has been saved locally and the hash registered on the blockchain.
          </p>
          <TransactionStatus
            state={tx.state}
            txHash={tx.txHash}
            receipt={tx.receipt}
            decodedEvents={tx.decodedEvents}
          />
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            <Button onClick={() => router.push(`/records/${savedId}`)}>View Record</Button>
          </div>
        </div>
      )}
    </div>
  );
}
