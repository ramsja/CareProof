/**
 * GET /api/activity  — fetch activity log entries
 *
 * Query params:
 *   wallet    — filter by wallet address
 *   recordId  — filter by local record ID
 *   eventName — filter by event type
 *   limit     — max entries to return (default 50, max 100)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { activityQuerySchema } from "@/lib/validation/schemas";
import { apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = activityQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!query.success) {
      return NextResponse.json(
        apiError("INVALID_QUERY", query.error.errors[0]?.message ?? "Invalid query."),
        { status: 400 },
      );
    }

    const { wallet, recordId, eventName, limit } = query.data;

    const activities = await prisma.activity.findMany({
      where: {
        ...(wallet    ? { walletAddress: wallet.toLowerCase() } : {}),
        ...(recordId  ? { recordId }                           : {}),
        ...(eventName ? { eventName }                          : {}),
      },
      orderBy: { timestamp: "desc" },
      take: limit,
      include: { record: { select: { id: true, title: true, category: true } } },
    });

    const serialized = activities.map((a) => ({
      id:                a.id,
      recordId:          a.recordId,
      walletAddress:     a.walletAddress,
      eventName:         a.eventName,
      transactionHash:   a.transactionHash,
      blockNumber:       a.blockNumber,
      blockchainRecordId: a.blockchainRecordId,
      eventArgs:         a.eventArgs ? JSON.parse(a.eventArgs) : null,
      timestamp:         a.timestamp.toISOString(),
      record:            a.record,
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (err) {
    console.error("[GET /api/activity]", err);
    return NextResponse.json(apiError("SERVER_ERROR", "Failed to fetch activity."), { status: 500 });
  }
}

// ── POST /api/activity  — record a new activity entry ────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Minimal validation inline — this endpoint is called internally only
    if (!body.walletAddress || !body.eventName) {
      return NextResponse.json(
        apiError("INVALID_ACTIVITY", "walletAddress and eventName are required."),
        { status: 400 },
      );
    }

    const activity = await prisma.activity.create({
      data: {
        recordId:           body.recordId ?? null,
        walletAddress:      (body.walletAddress as string).toLowerCase(),
        eventName:          body.eventName,
        transactionHash:    body.transactionHash ?? null,
        blockNumber:        body.blockNumber ?? null,
        blockchainRecordId: body.blockchainRecordId ?? null,
        eventArgs:          body.eventArgs ? JSON.stringify(body.eventArgs) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...activity,
          timestamp: activity.timestamp.toISOString(),
          eventArgs: activity.eventArgs ? JSON.parse(activity.eventArgs) : null,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/activity]", err);
    return NextResponse.json(apiError("SERVER_ERROR", "Failed to create activity."), { status: 500 });
  }
}
