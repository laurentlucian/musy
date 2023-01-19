-- AlterTable
ALTER TABLE "RecommendedSongs" ADD COLUMN "link" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "albumUri" TEXT NOT NULL,
    "albumName" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artistUri" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,
    "preview_url" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER NOT NULL
);
INSERT INTO "new_Track" ("albumName", "albumUri", "artist", "artistUri", "duration", "explicit", "id", "image", "name", "uri") SELECT "albumName", "albumUri", "artist", "artistUri", "duration", "explicit", "id", "image", "name", "uri" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_id_key" ON "Track"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
