/*
  Warnings:

  - A unique constraint covering the columns `[departmentId,name]` on the table `Position` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Position_departmentId_name_key" ON "Position"("departmentId", "name");
