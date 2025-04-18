/*
  Warnings:

  - A unique constraint covering the columns `[accountId,type]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Provider_accountId_type_key" ON "Provider"("accountId", "type");
