-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- AlterTable
ALTER TABLE "EmployeeShift" ADD COLUMN     "workDays" "Weekday"[];
