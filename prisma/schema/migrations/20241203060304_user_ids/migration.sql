-- First, let Prisma handle the schema changes
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Create new Provider table with accountId
CREATE TABLE "new_Provider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" BIGINT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create temporary mapping table
CREATE TABLE "_UserIdMapping" (
    "oldId" TEXT NOT NULL PRIMARY KEY,
    "newId" TEXT NOT NULL
);

-- Generate new UUIDs for existing users using SQLite's random functions
INSERT INTO "_UserIdMapping" ("oldId", "newId")
SELECT id, 
    lower(hex(randomblob(4))) || '-' || 
    lower(hex(randomblob(2))) || '-4' || 
    substr(lower(hex(randomblob(2))),2) || '-' || 
    substr('89ab',abs(random()) % 4 + 1, 1) || 
    substr(lower(hex(randomblob(2))),2) || '-' || 
    lower(hex(randomblob(6)))
FROM "User";

-- Copy Provider data and set accountId to the old User ID (Spotify ID)
INSERT INTO "new_Provider" (
    "id",
    "createdAt",
    "updatedAt",
    "type",
    "accountId",  -- This is the new column
    "accessToken",
    "refreshToken",
    "expiresAt",
    "tokenType",
    "revoked",
    "userId"
)
SELECT 
    "id",
    "createdAt",
    "updatedAt",
    "type",
    "userId",     -- Use the old userId (Spotify ID) as accountId
    "accessToken",
    "refreshToken",
    "expiresAt",
    "tokenType",
    "revoked",
    (SELECT "newId" FROM "_UserIdMapping" WHERE "oldId" = "Provider"."userId") -- Use new UUID
FROM "Provider";

-- Update User IDs
UPDATE "User" 
SET id = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = "User".id
);

-- Update related tables
UPDATE "Profile"
SET id = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = "Profile".id
);

UPDATE "Party"
SET ownerId = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = "Party".ownerId
);

UPDATE "Queue"
SET ownerId = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = "Queue".ownerId
);

-- Drop old Provider table and rename new one
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";

-- Add indexes
CREATE UNIQUE INDEX "Provider_userId_type_key" ON "Provider"("userId", "type");
CREATE UNIQUE INDEX "Provider_type_accountId_key" ON "Provider"("type", "accountId");

-- Clean up
DROP TABLE "_UserIdMapping";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;