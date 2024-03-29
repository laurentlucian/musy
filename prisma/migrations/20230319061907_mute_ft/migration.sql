-- CreateTable
CREATE TABLE "Mute" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "muteId" TEXT NOT NULL,
    "mutedById" TEXT NOT NULL,
    CONSTRAINT "Mute_muteId_fkey" FOREIGN KEY ("muteId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mute_mutedById_fkey" FOREIGN KEY ("mutedById") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
