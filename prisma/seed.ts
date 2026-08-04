/**
 * Seed script — populates the local SQLite database with fictional records.
 * All data is entirely fabricated. No real patient information is used.
 *
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { keccak256, toBytes } from "viem";

const prisma = new PrismaClient();

// Fictional Hardhat development addresses (publicly known — development only)
const DEV_OWNER_1 = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
const DEV_OWNER_2 = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";

interface SeedRecord {
  title: string;
  category: string;
  providerName: string;
  serviceDate: Date;
  description: string;
  externalReference?: string;
  ownerAddress: string;
  blockchainStatus: string;
  verificationStatus: string;
  blockchainRecordId?: string;
  transactionHash?: string;
  blockNumber?: string;
  deactivated?: boolean;
}

function buildHash(rec: Omit<SeedRecord, "blockchainStatus" | "verificationStatus" | "blockchainRecordId" | "transactionHash" | "blockNumber" | "deactivated">): string {
  const normalized = {
    title: rec.title.trim(),
    category: rec.category,
    providerName: rec.providerName.trim(),
    serviceDate: rec.serviceDate.toISOString().slice(0, 10),
    description: rec.description.trim(),
    externalReference: (rec.externalReference ?? "").trim(),
    ownerAddress: rec.ownerAddress.toLowerCase(),
  };
  return keccak256(toBytes(JSON.stringify(normalized)));
}

const seedRecords: SeedRecord[] = [
  {
    title: "Annual Physical Examination",
    category: "checkup",
    providerName: "Greenfield Medical Center",
    serviceDate: new Date("2026-03-15"),
    description: "Routine annual physical examination including blood pressure, weight, and general health assessment.",
    externalReference: "GF-2026-0315",
    ownerAddress: DEV_OWNER_1,
    blockchainStatus: "confirmed",
    verificationStatus: "verified",
    blockchainRecordId: "1",
    transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    blockNumber: "42",
  },
  {
    title: "Complete Blood Count Panel",
    category: "laboratory",
    providerName: "CityLab Diagnostics",
    serviceDate: new Date("2026-04-02"),
    description: "Full CBC with differential. Results reviewed by attending physician.",
    externalReference: "CLD-CBC-20260402",
    ownerAddress: DEV_OWNER_1,
    blockchainStatus: "confirmed",
    verificationStatus: "verified",
    blockchainRecordId: "2",
    transactionHash: "0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678cd",
    blockNumber: "85",
  },
  {
    title: "Influenza Vaccination",
    category: "vaccination",
    providerName: "Harbour Pharmacy Clinic",
    serviceDate: new Date("2025-10-20"),
    description: "Seasonal influenza vaccination, quadrivalent formula.",
    ownerAddress: DEV_OWNER_1,
    blockchainStatus: "draft",
    verificationStatus: "not_registered",
  },
  {
    title: "General Practitioner Consultation",
    category: "consultation",
    providerName: "Dr. Elena Marsh — Eastside Clinic",
    serviceDate: new Date("2026-05-08"),
    description: "Follow-up consultation regarding seasonal allergies and sleep quality.",
    externalReference: "EC-CONSULT-0508",
    ownerAddress: DEV_OWNER_1,
    blockchainStatus: "confirmed",
    verificationStatus: "verified",
    blockchainRecordId: "3",
    transactionHash: "0x1234abcd5678ef901234abcd5678ef901234abcd5678ef901234abcd5678ef90ab",
    blockNumber: "120",
  },
  {
    title: "Amoxicillin Prescription — Acute Sinusitis",
    category: "prescription",
    providerName: "Eastside Clinic",
    serviceDate: new Date("2026-05-08"),
    description: "Amoxicillin 500 mg, three times daily for 7 days. Issued following GP consultation.",
    externalReference: "RX-2026-05-008-A",
    ownerAddress: DEV_OWNER_1,
    blockchainStatus: "confirmed",
    verificationStatus: "modified",
    blockchainRecordId: "4",
    transactionHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcbaab",
    blockNumber: "131",
  },
  {
    title: "Health Insurance Certificate 2026",
    category: "insurance",
    providerName: "BlueShield Healthcare Group",
    serviceDate: new Date("2026-01-01"),
    description: "Annual health insurance certificate for coverage year 2026.",
    externalReference: "BSH-2026-CERT-00441",
    ownerAddress: DEV_OWNER_1,
    blockchainStatus: "failed",
    verificationStatus: "not_verified",
  },
  {
    title: "Chest X-Ray — Respiratory Assessment",
    category: "laboratory",
    providerName: "Metro Imaging Centre",
    serviceDate: new Date("2026-04-18"),
    description: "PA and lateral chest X-ray. No acute cardiopulmonary findings identified.",
    externalReference: "MIC-XR-2026-0418",
    ownerAddress: DEV_OWNER_2,
    blockchainStatus: "confirmed",
    verificationStatus: "verified",
    blockchainRecordId: "5",
    transactionHash: "0xfeedface1234567890abcdef1234567890abcdef1234567890abcdef12345678ef",
    blockNumber: "200",
  },
  {
    title: "Deactivated Record — Duplicate Entry",
    category: "other",
    providerName: "Greenfield Medical Center",
    serviceDate: new Date("2026-02-14"),
    description: "This record was registered in error and subsequently deactivated. Historical data preserved.",
    ownerAddress: DEV_OWNER_2,
    blockchainStatus: "confirmed",
    verificationStatus: "deactivated",
    blockchainRecordId: "6",
    transactionHash: "0xbaadf00d1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    blockNumber: "66",
    deactivated: true,
  },
];

async function main() {
  console.log("🌱 Seeding CareProof database with fictional records...\n");

  await prisma.activity.deleteMany();
  await prisma.record.deleteMany();

  for (const rec of seedRecords) {
    const dataHash = buildHash(rec);
    const created = await prisma.record.create({
      data: {
        title: rec.title,
        category: rec.category,
        providerName: rec.providerName,
        serviceDate: rec.serviceDate,
        description: rec.description,
        externalReference: rec.externalReference,
        ownerAddress: rec.ownerAddress.toLowerCase(),
        dataHash,
        blockchainStatus: rec.blockchainStatus,
        verificationStatus: rec.verificationStatus,
        blockchainRecordId: rec.blockchainRecordId,
        transactionHash: rec.transactionHash,
        blockNumber: rec.blockNumber,
        deactivated: rec.deactivated ?? false,
        confirmationTime: rec.blockchainStatus === "confirmed" ? new Date() : null,
      },
    });

    // Create a matching activity entry for confirmed records
    if (rec.blockchainStatus === "confirmed" && rec.transactionHash) {
      await prisma.activity.create({
        data: {
          recordId: created.id,
          walletAddress: rec.ownerAddress.toLowerCase(),
          eventName: rec.deactivated ? "RecordDeactivated" : "RecordRegistered",
          transactionHash: rec.transactionHash,
          blockNumber: rec.blockNumber,
          blockchainRecordId: rec.blockchainRecordId,
          eventArgs: JSON.stringify({
            recordId: rec.blockchainRecordId,
            dataHash,
            owner: rec.ownerAddress.toLowerCase(),
          }),
        },
      });
    }

    console.log(`  ✅ ${rec.title} [${rec.blockchainStatus}]`);
  }

  const total = await prisma.record.count();
  console.log(`\n✅ Seed complete — ${total} records created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
