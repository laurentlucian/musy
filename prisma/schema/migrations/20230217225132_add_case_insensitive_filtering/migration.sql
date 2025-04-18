/*
  Warnings:

  - You are about to drop the `mytable` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "mytable";
PRAGMA foreign_keys=on;
