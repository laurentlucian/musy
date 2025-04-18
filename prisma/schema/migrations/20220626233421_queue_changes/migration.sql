-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "bio" TEXT;

-- CreateTable
CREATE TABLE "Queue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uri" TEXT NOT NULL DEFAULT 'test',
    "name" TEXT NOT NULL DEFAULT 'test',
    "image" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,
    "userId" TEXT,
    "userImage" TEXT,
    CONSTRAINT "Queue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
