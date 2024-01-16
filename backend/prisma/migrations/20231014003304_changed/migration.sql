/*
  Warnings:

  - You are about to drop the column `visibility` on the `ChannelMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'public';

-- AlterTable
ALTER TABLE "ChannelMessage" DROP COLUMN "visibility";
