import { describe, it, expect } from "vitest";
import { hashRecord, hashNormalizedRecord } from "@/lib/records/hash";
import { normalizeRecord } from "@/lib/records/normalize";

const base = {
  title:             "Annual Checkup",
  category:          "checkup" as const,
  providerName:      "Example Health Center",
  serviceDate:       "2026-06-20",
  description:       "Routine annual health assessment",
  externalReference: "REF-1024",
  ownerAddress:      "0x1234567890123456789012345678901234567890",
};

describe("hashRecord", () => {
  it("returns a 0x-prefixed hex string of 66 characters (32 bytes)", () => {
    const hash = hashRecord(base);
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("identical records generate identical hashes", () => {
    const h1 = hashRecord(base);
    const h2 = hashRecord({ ...base });
    expect(h1).toBe(h2);
  });

  it("extra surrounding spaces do not change the normalised hash", () => {
    const h1 = hashRecord(base);
    const h2 = hashRecord({ ...base, title: "  Annual Checkup  ", description: "  Routine annual health assessment  " });
    expect(h1).toBe(h2);
  });

  it("address casing does not change the normalised hash", () => {
    const h1 = hashRecord(base);
    const h2 = hashRecord({ ...base, ownerAddress: "0x1234567890123456789012345678901234567890".toUpperCase() });
    expect(h1).toBe(h2);
  });

  it("changing the description changes the hash", () => {
    const h1 = hashRecord(base);
    const h2 = hashRecord({ ...base, description: "A completely different description." });
    expect(h1).not.toBe(h2);
  });

  it("changing the title changes the hash", () => {
    const h1 = hashRecord(base);
    const h2 = hashRecord({ ...base, title: "Different Title" });
    expect(h1).not.toBe(h2);
  });

  it("changing the category changes the hash", () => {
    const h1 = hashRecord(base);
    const h2 = hashRecord({ ...base, category: "laboratory" as const });
    expect(h1).not.toBe(h2);
  });

  it("different ownerAddress changes the hash", () => {
    const h1 = hashRecord(base);
    const h2 = hashRecord({ ...base, ownerAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" });
    expect(h1).not.toBe(h2);
  });
});

describe("hashNormalizedRecord", () => {
  it("produces the same result as hashRecord for equivalent input", () => {
    const normalized = normalizeRecord(base);
    expect(hashNormalizedRecord(normalized)).toBe(hashRecord(base));
  });
});
