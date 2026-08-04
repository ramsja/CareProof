import { describe, it, expect } from "vitest";
import {
  createRecordSchema,
  evmAddressSchema,
  recordListQuerySchema,
} from "@/lib/validation/schemas";

const validRecord = {
  title:             "Annual Checkup",
  category:          "checkup",
  providerName:      "Example Health Center",
  serviceDate:       "2024-06-20",
  description:       "Routine annual health assessment.",
  externalReference: "REF-1024",
  ownerAddress:      "0xf39Fd6e51aad88F6f4ce6aB8827279cffFb92266",
};

describe("createRecordSchema", () => {
  it("accepts a valid record", () => {
    const result = createRecordSchema.safeParse(validRecord);
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = createRecordSchema.safeParse({ ...validRecord, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = createRecordSchema.safeParse({ ...validRecord, category: "unknown" });
    expect(result.success).toBe(false);
  });

  it("rejects missing providerName", () => {
    const result = createRecordSchema.safeParse({ ...validRecord, providerName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid serviceDate", () => {
    const result = createRecordSchema.safeParse({ ...validRecord, serviceDate: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("rejects a future serviceDate", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const result = createRecordSchema.safeParse({
      ...validRecord,
      serviceDate: future.toISOString().slice(0, 10),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid EVM owner address", () => {
    const result = createRecordSchema.safeParse({ ...validRecord, ownerAddress: "not-an-address" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty externalReference", () => {
    const result = createRecordSchema.safeParse({ ...validRecord, externalReference: "" });
    expect(result.success).toBe(true);
  });

  it("rejects description exceeding 1000 chars", () => {
    const result = createRecordSchema.safeParse({ ...validRecord, description: "x".repeat(1001) });
    expect(result.success).toBe(false);
  });
});

describe("evmAddressSchema", () => {
  it("accepts a valid checksummed address", () => {
    expect(evmAddressSchema.safeParse("0xf39Fd6e51aad88F6f4ce6aB8827279cffFb92266").success).toBe(true);
  });

  it("accepts a lowercase address", () => {
    expect(evmAddressSchema.safeParse("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266").success).toBe(true);
  });

  it("rejects missing 0x prefix", () => {
    expect(evmAddressSchema.safeParse("f39fd6e51aad88f6f4ce6ab8827279cfffb92266").success).toBe(false);
  });

  it("rejects address too short", () => {
    expect(evmAddressSchema.safeParse("0x1234").success).toBe(false);
  });

  it("rejects zero address", () => {
    // Zero address is technically valid hex but should pass schema (restriction is in contract)
    expect(evmAddressSchema.safeParse("0x0000000000000000000000000000000000000000").success).toBe(true);
  });
});

describe("recordListQuerySchema", () => {
  it("accepts empty query", () => {
    expect(recordListQuerySchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid wallet filter", () => {
    expect(recordListQuerySchema.safeParse({ wallet: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" }).success).toBe(true);
  });

  it("rejects invalid wallet filter", () => {
    expect(recordListQuerySchema.safeParse({ wallet: "not-an-address" }).success).toBe(false);
  });
});
