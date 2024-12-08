-- CreateTable
CREATE TABLE "Sync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "state" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "state" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "skip" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE INDEX "Sync_userId_idx" ON "Sync"("userId");

-- CreateIndex
CREATE INDEX "Sync_createdAt_idx" ON "Sync"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Sync_userId_type_key" ON "Sync"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_userId_type_key" ON "Transfer"("userId", "type");
