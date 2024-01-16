/*
  Warnings:

  - You are about to drop the column `userId` on the `Friends` table. All the data in the column will be lost.
  - Added the required column `MefriendsOfId` to the `Friends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MyfriendId` to the `Friends` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_userId_fkey";

-- AlterTable
ALTER TABLE "Friends" DROP COLUMN "userId",
ADD COLUMN     "MefriendsOfId" TEXT NOT NULL,
ADD COLUMN     "MyfriendId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_MyfriendId_fkey" FOREIGN KEY ("MyfriendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_MefriendsOfId_fkey" FOREIGN KEY ("MefriendsOfId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
