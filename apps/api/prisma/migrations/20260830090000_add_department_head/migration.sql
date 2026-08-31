-- AlterTable
ALTER TABLE "Department" ADD COLUMN "departmentHeadId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Department_departmentHeadId_key" ON "Department"("departmentHeadId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_departmentHeadId_fkey" FOREIGN KEY ("departmentHeadId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
