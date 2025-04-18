-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Theme" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "version" INTEGER NOT NULL DEFAULT 0,
    "isPreset" BOOLEAN NOT NULL DEFAULT true,
    "backgroundLight" TEXT NOT NULL DEFAULT '#EEE6E2',
    "backgroundDark" TEXT NOT NULL DEFAULT '#090808',
    "mainTextLight" TEXT NOT NULL DEFAULT '#161616',
    "mainTextDark" TEXT NOT NULL DEFAULT '#EEE6E2',
    "subTextLight" TEXT NOT NULL DEFAULT '#161616',
    "subTextDark" TEXT NOT NULL DEFAULT '#EEE6E2',
    "gradient" BOOLEAN NOT NULL DEFAULT false,
    "bgGradientDark" TEXT NOT NULL DEFAULT 'linear(to-t, #090808 40%, #fcbde2 90%)',
    "bgGradientLight" TEXT NOT NULL DEFAULT 'linear(to-t, #EEE6E2 40%, #fcbde2 90%)',
    "customPlayer" BLOB,
    "playerColorLight" TEXT NOT NULL DEFAULT '#E7DFD9',
    "playerColorDark" TEXT NOT NULL DEFAULT '#101010',
    "blur" BOOLEAN NOT NULL DEFAULT true,
    "opaque" BOOLEAN NOT NULL DEFAULT false,
    "musyLogo" TEXT NOT NULL DEFAULT 'musy',
    CONSTRAINT "Theme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Theme" ("backgroundDark", "backgroundLight", "bgGradientDark", "bgGradientLight", "blur", "customPlayer", "gradient", "isPreset", "mainTextDark", "mainTextLight", "musyLogo", "opaque", "playerColorDark", "playerColorLight", "subTextDark", "subTextLight", "userId") SELECT "backgroundDark", "backgroundLight", "bgGradientDark", "bgGradientLight", "blur", "customPlayer", "gradient", "isPreset", "mainTextDark", "mainTextLight", "musyLogo", "opaque", "playerColorDark", "playerColorLight", "subTextDark", "subTextLight", "userId" FROM "Theme";
DROP TABLE "Theme";
ALTER TABLE "new_Theme" RENAME TO "Theme";
CREATE UNIQUE INDEX "Theme_userId_key" ON "Theme"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
