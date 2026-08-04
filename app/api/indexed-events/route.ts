/**
 * GET /api/indexed-events
 *
 * Returns blockchain events persisted by the event indexer (IndexedEvent table).
 * This is distinct from GET /api/activity, which stores app-written activity rows
 * after wallet transactions.
 *
 * Until the indexer is implemented, this endpoint returns an empty list.
 *
 * Query params:
 *   eventName — optional filter
 *   page      — default 1
 *   pageSize  — default 20, max 100
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { indexedEventsQuerySchema } from "@/lib/validation/schemas";
import { apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const parsed = indexedEventsQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json(
        apiError("INVALID_QUERY", parsed.error.errors[0]?.message ?? "Invalid query."),
        { status: 400 },
      );
    }

    const { eventName, page, pageSize } = parsed.data;
    const where = {
      ...(eventName ? { eventName } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.indexedEvent.count({ where }),
      prisma.indexedEvent.findMany({
        where,
        orderBy: [{ blockNumber: "desc" }, { logIndex: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const serialized = items.map((item) => ({
      id: item.id,
      chainId: item.chainId,
      contractAddress: item.contractAddress,
      eventName: item.eventName,
      blockNumber: item.blockNumber,
      blockHash: item.blockHash,
      transactionHash: item.transactionHash,
      transactionIndex: item.transactionIndex,
      logIndex: item.logIndex,
      payload: safeJsonParse(item.payload),
      processedAt: item.processedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: serialized,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (err) {
    console.error("[GET /api/indexed-events]", err);
    return NextResponse.json(
      apiError("SERVER_ERROR", "Failed to fetch indexed events."),
      { status: 500 },
    );
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
