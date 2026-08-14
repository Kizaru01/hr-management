-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "lateMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "undertimeMinutes" INTEGER NOT NULL DEFAULT 0;
