import prisma from "../database";

export async function createNewCart(
  items: { productId: string; quantity: number }[]
) {
  const cart = await prisma.cart.create({
    data: {
      CartEntries: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    select: {
      id: true,
      status: true,
      CartEntries: {
        select: {
          productId: true,
          quantity: true,
        },
      },
    },
  });

  return cart;
}
