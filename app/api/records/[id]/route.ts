/**
 * GET   /api/records/[id]  — get a single record
 * PATCH /api/records/[id]  — update blockchain metadata after a transaction
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateRecordSchema } from "@/lib/validation/schemas";
import { apiError } from "@/lib/utils";

type RouteContext = { params: { id: string } };

// ── GET /api/records/[id] ─────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const record = await prisma.record.findUnique({
      where: { id: params.id },
      include: { activities: { orderBy: { timestamp: "desc" }, take: 20 } },
    });

    if (!record) {
      return NextResponse.json(
        apiError("RECORD_NOT_FOUND", "The requested record does not exist."),
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: serializeRecord(record) });
  } catch (err) {
    console.error("[GET /api/records/[id]]", err);
    return NextResponse.json(apiError("SERVER_ERROR", "Failed to fetch record."), { status: 500 });
  }
}

// ── PATCH /api/records/[id] ───────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const body = await req.json();
    const parsed = updateRecordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError("INVALID_UPDATE", parsed.error.errors[0]?.message ?? "Invalid update."),
        { status: 400 },
      );
    }

    const existing = await prisma.record.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        apiError("RECORD_NOT_FOUND", "The requested record does not exist."),
        { status: 404 },
      );
    }

    const data = parsed.data;

    const updated = await prisma.record.update({
      where: { id: params.id },
      data: {
        ...(data.blockchainStatus   !== undefined && { blockchainStatus:   data.blockchainStatus }),
        ...(data.verificationStatus !== undefined && { verificationStatus: data.verificationStatus }),
        ...(data.blockchainRecordId !== undefined && { blockchainRecordId: data.blockchainRecordId }),
        ...(data.transactionHash    !== undefined && { transactionHash:    data.transactionHash || null }),
        ...(data.blockNumber        !== undefined && { blockNumber:        data.blockNumber }),
        ...(data.deactivated        !== undefined && { deactivated:        data.deactivated }),
        ...(data.confirmationTime   !== undefined && {
          confirmationTime: data.confirmationTime ? new Date(data.confirmationTime) : null,
        }),
      },
    });

    // Log activity when a confirmed blockchain status is written
    if (
      data.blockchainStatus === "confirmed" &&
      data.transactionHash &&
      data.blockchainRecordId
    ) {
      await prisma.activity.create({
        data: {
          recordId:          updated.id,
          walletAddress:     updated.ownerAddress,
          eventName:         data.deactivated ? "RecordDeactivated" : "RecordRegistered",
          transactionHash:   data.transactionHash,
          blockNumber:       data.blockNumber ?? null,
          blockchainRecordId: data.blockchainRecordId,
          eventArgs: JSON.stringify({
            recordId:  data.blockchainRecordId,
            dataHash:  updated.dataHash,
            owner:     updated.ownerAddress,
          }),
        },
      });
    }

    return NextResponse.json({ success: true, data: serializeRecord(updated) });
  } catch (err) {
    console.error("[PATCH /api/records/[id]]", err);
    return NextResponse.json(apiError("SERVER_ERROR", "Failed to update record."), { status: 500 });
  }
}

// ── Serialiser ────────────────────────────────────────────────────────────────

function serializeRecord(record: Record<string, unknown> & { activities?: Record<string, unknown>[] }) {
  return {
    ...record,
    serviceDate:      record.serviceDate instanceof Date
      ? record.serviceDate.toISOString().slice(0, 10)
      : record.serviceDate,
    confirmationTime: record.confirmationTime instanceof Date
      ? record.confirmationTime.toISOString()
      : record.confirmationTime ?? null,
    createdAt: record.createdAt instanceof Date
      ? record.createdAt.toISOString()
      : record.createdAt,
    updatedAt: record.updatedAt instanceof Date
      ? record.updatedAt.toISOString()
      : record.updatedAt,
    activities: record.activities?.map((a: Record<string, unknown>) => ({
      ...a,
      timestamp: a["timestamp"] instanceof Date ? (a["timestamp"] as Date).toISOString() : a["timestamp"],
      eventArgs: a["eventArgs"] ? JSON.parse(a["eventArgs"] as string) : null,
    })) ?? undefined,
  };
}
