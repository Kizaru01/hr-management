/*
  Warnings:

  - A unique constraint covering the columns `[nameKey]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nameKey` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "nameKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Department_nameKey_key" ON "Department"("nameKey");
