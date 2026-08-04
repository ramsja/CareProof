-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "serviceDate" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "externalReference" TEXT,
    "ownerAddress" TEXT NOT NULL,
    "dataHash" TEXT NOT NULL,
    "blockchainRecordId" TEXT,
    "transactionHash" TEXT,
    "blockNumber" TEXT,
    "blockchainStatus" TEXT NOT NULL DEFAULT 'draft',
    "verificationStatus" TEXT NOT NULL DEFAULT 'not_verified',
    "deactivated" BOOLEAN NOT NULL DEFAULT false,
    "confirmationTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordId" TEXT,
    "walletAddress" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "transactionHash" TEXT,
    "blockNumber" TEXT,
    "blockchainRecordId" TEXT,
    "eventArgs" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Record_ownerAddress_idx" ON "Record"("ownerAddress");

-- CreateIndex
CREATE INDEX "Record_blockchainStatus_idx" ON "Record"("blockchainStatus");

-- CreateIndex
CREATE INDEX "Record_verificationStatus_idx" ON "Record"("verificationStatus");

-- CreateIndex
CREATE INDEX "Activity_walletAddress_idx" ON "Activity"("walletAddress");

-- CreateIndex
CREATE INDEX "Activity_recordId_idx" ON "Activity"("recordId");

-- CreateIndex
CREATE INDEX "Activity_eventName_idx" ON "Activity"("eventName");
