-- DropForeignKey
ALTER TABLE "CartEntries" DROP CONSTRAINT "CartEntries_cartId_fkey";

-- AddForeignKey
ALTER TABLE "CartEntries" ADD CONSTRAINT "CartEntries_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
