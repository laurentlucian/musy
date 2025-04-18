/*
  Warnings:

  - The primary key for the `Sync` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Sync` table. All the data in the column will be lost.
  - The primary key for the `Transfer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Transfer` table. All the data in the column will be lost.
  - Added the required column `destination` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Transfer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sync" (
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "state" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    PRIMARY KEY ("userId", "type", "state")
);
INSERT INTO "new_Sync" ("createdAt", "state", "type", "updatedAt", "userId") SELECT "createdAt", "state", "type", "updatedAt", "userId" FROM "Sync";
DROP TABLE "Sync";
ALTER TABLE "new_Sync" RENAME TO "Sync";
CREATE TABLE "new_Transfer" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "skip" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "source", "destination", "type")
);
INSERT INTO "new_Transfer" ("createdAt", "skip", "state", "type", "updatedAt", "userId") SELECT "createdAt", "skip", "state", "type", "updatedAt", "userId" FROM "Transfer";
DROP TABLE "Transfer";
ALTER TABLE "new_Transfer" RENAME TO "Transfer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
