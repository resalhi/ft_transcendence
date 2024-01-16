/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ChannelMessage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'owner';

-- AlterTable
ALTER TABLE "ChannelMessage" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "ChannelInvite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "ChannelInvite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChannelInvite" ADD CONSTRAINT "ChannelInvite_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelInvite" ADD CONSTRAINT "ChannelInvite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelInvite" ADD CONSTRAINT "ChannelInvite_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
