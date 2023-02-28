/*
  Warnings:

  - You are about to drop the column `productId` on the `Cart` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('OPEN', 'SENT', 'CANCELLED', 'PAID');

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "productId";
ALTER TABLE "Cart" ADD COLUMN     "status" "CartStatus" NOT NULL DEFAULT 'OPEN';
