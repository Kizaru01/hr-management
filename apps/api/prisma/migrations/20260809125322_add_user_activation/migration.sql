/*
  Warnings:

  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'active', 'suspended', 'disabled');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActive",
ADD COLUMN     "activationExpiresAt" TIMESTAMP(3),
ADD COLUMN     "activationTokenHash" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "passwordHash" DROP NOT NULL;
