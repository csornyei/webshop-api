-- CreateTable
CREATE TABLE "Cart" (
    "id" STRING NOT NULL,
    "productId" STRING,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartEntries" (
    "id" STRING NOT NULL,
    "productId" STRING NOT NULL,
    "quantity" INT4 NOT NULL,
    "cartId" STRING NOT NULL,

    CONSTRAINT "CartEntries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CartEntries" ADD CONSTRAINT "CartEntries_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartEntries" ADD CONSTRAINT "CartEntries_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
