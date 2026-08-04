import { describe, it, expect } from "vitest";
import { normalizeRecord, toISODate } from "@/lib/records/normalize";

describe("normalizeRecord", () => {
  const base = {
    title:             "  Annual Checkup  ",
    category:          "checkup" as const,
    providerName:      "  Example Health Center  ",
    serviceDate:       "2026-06-20",
    description:       "  Routine annual health assessment  ",
    externalReference: "  REF-1024  ",
    ownerAddress:      "0x1234567890123456789012345678901234567890",
  };

  it("trims whitespace from text fields", () => {
    const result = normalizeRecord(base);
    expect(result.title).toBe("Annual Checkup");
    expect(result.providerName).toBe("Example Health Center");
    expect(result.description).toBe("Routine annual health assessment");
    expect(result.externalReference).toBe("REF-1024");
  });

  it("lowercases the owner address", () => {
    const result = normalizeRecord({ ...base, ownerAddress: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12" });
    expect(result.ownerAddress).toBe("0xabcdef1234567890abcdef1234567890abcdef12");
  });

  it("address casing does not change the normalised output", () => {
    const lower = normalizeRecord({ ...base, ownerAddress: "0xabcdef1234567890abcdef1234567890abcdef12" });
    const upper = normalizeRecord({ ...base, ownerAddress: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12" });
    expect(lower).toEqual(upper);
  });

  it("converts serviceDate to ISO YYYY-MM-DD", () => {
    const result = normalizeRecord(base);
    expect(result.serviceDate).toBe("2026-06-20");
  });

  it("converts Date object to ISO YYYY-MM-DD", () => {
    const result = normalizeRecord({ ...base, serviceDate: new Date("2026-06-20") });
    expect(result.serviceDate).toBe("2026-06-20");
  });

  it("converts missing externalReference to empty string", () => {
    const result = normalizeRecord({ ...base, externalReference: undefined });
    expect(result.externalReference).toBe("");
  });

  it("converts null externalReference to empty string", () => {
    const result = normalizeRecord({ ...base, externalReference: null });
    expect(result.externalReference).toBe("");
  });

  it("uses a fixed property order", () => {
    const keys = Object.keys(normalizeRecord(base));
    expect(keys).toEqual([
      "title", "category", "providerName", "serviceDate",
      "description", "externalReference", "ownerAddress",
    ]);
  });
});

describe("toISODate", () => {
  it("passes through a YYYY-MM-DD string unchanged", () => {
    expect(toISODate("2026-06-20")).toBe("2026-06-20");
  });

  it("converts a Date object", () => {
    expect(toISODate(new Date("2026-06-20T00:00:00Z"))).toBe("2026-06-20");
  });

  it("throws on an invalid date string", () => {
    expect(() => toISODate("not-a-date")).toThrow();
  });
});
