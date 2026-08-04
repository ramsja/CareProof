/**
 * POST /api/records  — create a new record (draft)
 * GET  /api/records  — list records by wallet, with optional filters
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeRecord } from "@/lib/records/normalize";
import { hashNormalizedRecord } from "@/lib/records/hash";
import {
  createRecordSchema,
  recordListQuerySchema,
} from "@/lib/validation/schemas";
import { apiError } from "@/lib/utils";

// ── POST /api/records ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createRecordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError("INVALID_RECORD", parsed.error.errors[0]?.message ?? "Invalid input."),
        { status: 400 },
      );
    }

    const input = parsed.data;
    const normalized = normalizeRecord(input);
    const dataHash = hashNormalizedRecord(normalized);

    const record = await prisma.record.create({
      data: {
        title:             normalized.title,
        category:          normalized.category,
        providerName:      normalized.providerName,
        serviceDate:       new Date(normalized.serviceDate),
        description:       normalized.description,
        externalReference: normalized.externalReference || null,
        ownerAddress:      normalized.ownerAddress,
        dataHash,
        blockchainStatus:   "draft",
        verificationStatus: "not_registered",
      },
    });

    return NextResponse.json({ success: true, data: serializeRecord(record) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/records]", err);
    return NextResponse.json(apiError("SERVER_ERROR", "Failed to create record."), { status: 500 });
  }
}

// ── GET /api/records ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = recordListQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!query.success) {
      return NextResponse.json(
        apiError("INVALID_QUERY", query.error.errors[0]?.message ?? "Invalid query."),
        { status: 400 },
      );
    }

    const { wallet, category, blockchainStatus, verificationStatus, search } = query.data;

    const records = await prisma.record.findMany({
      where: {
        ...(wallet           ? { ownerAddress: wallet.toLowerCase() }   : {}),
        ...(category         ? { category }                             : {}),
        ...(blockchainStatus ? { blockchainStatus }                     : {}),
        ...(verificationStatus ? { verificationStatus }                 : {}),
        ...(search
          ? {
              OR: [
                { title:        { contains: search } },
                { providerName: { contains: search } },
                { description:  { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: records.map(serializeRecord) });
  } catch (err) {
    console.error("[GET /api/records]", err);
    return NextResponse.json(apiError("SERVER_ERROR", "Failed to fetch records."), { status: 500 });
  }
}

// ── Serialiser ────────────────────────────────────────────────────────────────

function serializeRecord(record: {
  id: string;
  title: string;
  category: string;
  providerName: string;
  serviceDate: Date;
  description: string;
  externalReference: string | null;
  ownerAddress: string;
  dataHash: string;
  blockchainRecordId: string | null;
  transactionHash: string | null;
  blockNumber: string | null;
  blockchainStatus: string;
  verificationStatus: string;
  deactivated: boolean;
  confirmationTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...record,
    serviceDate:      record.serviceDate.toISOString().slice(0, 10),
    confirmationTime: record.confirmationTime?.toISOString() ?? null,
    createdAt:        record.createdAt.toISOString(),
    updatedAt:        record.updatedAt.toISOString(),
  };
}
