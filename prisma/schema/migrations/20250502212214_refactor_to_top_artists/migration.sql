-- CreateTable
CREATE TABLE "Top" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "Top_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TopArtists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "artistIds" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TopArtists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Top" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ArtistToTopArtists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ArtistToTopArtists_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ArtistToTopArtists_B_fkey" FOREIGN KEY ("B") REFERENCES "TopArtists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Create Top records for existing TopSongs users
INSERT INTO "Top" ("userId")
SELECT DISTINCT "userId" FROM "TopSongs";

-- Create new TopSongs table
CREATE TABLE "new_TopSongs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "trackIds" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TopSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Top" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Copy data maintaining the same userId which now references Top
INSERT INTO "new_TopSongs" ("id", "createdAt", "trackIds", "type", "userId")
SELECT "id", "createdAt", "trackIds", "type", "userId"
FROM "TopSongs";

DROP TABLE "TopSongs";
ALTER TABLE "new_TopSongs" RENAME TO "TopSongs";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Top_userId_key" ON "Top"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TopSongs_id_key" ON "TopSongs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TopArtists_id_key" ON "TopArtists"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToTopArtists_AB_unique" ON "_ArtistToTopArtists"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToTopArtists_B_index" ON "_ArtistToTopArtists"("B");
