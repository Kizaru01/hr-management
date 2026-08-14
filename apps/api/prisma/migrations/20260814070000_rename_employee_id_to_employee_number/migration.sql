ALTER TABLE "Employee" RENAME COLUMN "employeeId" TO "employeeNumber";

ALTER INDEX "Employee_employeeId_key" RENAME TO "Employee_employeeNumber_key";
