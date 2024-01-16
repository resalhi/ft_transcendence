/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `BlockedUsers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DirectMessage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Friends` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `total_goals` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "BlockedUsers" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "DirectMessage" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Friends" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "GameHistory" ALTER COLUMN "user_score" SET DEFAULT 0,
ALTER COLUMN "opp_score" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "total_goals" SET NOT NULL,
ALTER COLUMN "total_goals" SET DEFAULT 0;

-- DropTable
DROP TABLE "Notification";

-- CreateTable
CREATE TABLE "GameInvite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "GameInvite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameInvite" ADD CONSTRAINT "GameInvite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameInvite" ADD CONSTRAINT "GameInvite_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
