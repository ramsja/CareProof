-- AlterTable: add blockchain indexing models for CareProofRegistry event indexing

CREATE TABLE "ChainCursor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" INTEGER NOT NULL,
    "lastProcessedBlock" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "ChainCursor_chainId_key" ON "ChainCursor"("chainId");

CREATE TABLE "IndexedEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockHash" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "payload" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "IndexedEvent_chainId_transactionHash_logIndex_key" ON "IndexedEvent"("chainId", "transactionHash", "logIndex");
CREATE INDEX "IndexedEvent_eventName_idx" ON "IndexedEvent"("eventName");
CREATE INDEX "IndexedEvent_blockNumber_idx" ON "IndexedEvent"("blockNumber");
CREATE INDEX "IndexedEvent_transactionHash_idx" ON "IndexedEvent"("transactionHash");
