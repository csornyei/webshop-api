import prisma from "../database";
import { BadRequestError, NotFoundError } from "../error/errors";
import { calculatePrice, filterExistingProducts } from "./product";

export async function createNewCart(
  items: { productId: string; quantity: number }[],
  userId: string
) {
  const cart = await prisma.cart.create({
    data: {
      userId: userId,
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
      userId: true,
      CartEntries: {
        select: {
          product: {
            select: {
              name: true,
              price: true,
            },
          },
          productId: true,
          quantity: true,
        },
      },
    },
  });

  const price = await calculatePrice(cart.CartEntries);

  return { ...cart, price };
}

export async function getCart(id: string) {
  const cart = await prisma.cart.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      userId: true,
      CartEntries: {
        select: {
          product: {
            select: {
              name: true,
              price: true,
            },
          },
          productId: true,
          quantity: true,
        },
      },
    },
  });

  if (!cart) {
    throw new NotFoundError();
  }

  const price = await calculatePrice(cart.CartEntries);

  return { ...cart, price };
}

export async function updateCart(
  id: string,
  items: { productId: string; quantity: number }[]
) {
  const existingCart = await prisma.cart.findMany({
    where: {
      id,
    },
    include: {
      CartEntries: true,
    },
  });

  if (existingCart.length === 0) {
    throw new NotFoundError();
  }

  if (existingCart[0].status !== "OPEN") {
    throw new BadRequestError("Cart is not open");
  }

  const existingItems = await filterExistingProducts(items);

  const [removeItems, updateItems, newItems] = existingItems.reduce(
    (acc, item) => {
      if (item.quantity === 0) {
        return [[...acc[0], item.productId], acc[1], acc[2]];
      }
      if (
        existingCart[0].CartEntries.findIndex(
          (e) => e.productId === item.productId
        ) === -1
      ) {
        return [acc[0], acc[1], [...acc[2], item]];
      }
      return [acc[0], [...acc[1], item], acc[2]];
    },
    [[], [], []] as [
      string[],
      { productId: string; quantity: number }[],
      { productId: string; quantity: number }[]
    ]
  );

  const cart = await prisma.cart.update({
    where: {
      id,
    },
    data: {
      CartEntries: {
        updateMany: updateItems.map((item) => ({
          where: {
            productId: item.productId,
          },
          data: {
            quantity: item.quantity,
          },
        })),
        create: newItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deleteMany: {
          productId: {
            in: removeItems,
          },
        },
      },
    },
    select: {
      id: true,
      status: true,
      userId: true,
      CartEntries: {
        select: {
          product: {
            select: {
              name: true,
              price: true,
            },
          },
          productId: true,
          quantity: true,
        },
      },
    },
  });

  const price = await calculatePrice(cart.CartEntries);

  return { ...cart, price };
}

export async function cancelCart(id: string) {
  const cart = await prisma.cart.update({
    where: { id },
    data: {
      status: "CANCELLED",
    },
    select: {
      id: true,
      status: true,
      userId: true,
      CartEntries: {
        select: {
          product: {
            select: {
              name: true,
              price: true,
            },
          },
          productId: true,
          quantity: true,
        },
      },
    },
  });

  return { ...cart };
}

export async function checkoutCart(id: string) {
  const cart = await prisma.cart.update({
    where: { id },
    data: {
      status: "SENT",
    },
    select: {
      id: true,
      status: true,
      userId: true,
      CartEntries: {
        select: {
          product: {
            select: {
              name: true,
              price: true,
            },
          },
          productId: true,
          quantity: true,
        },
      },
    },
  });

  const price = await calculatePrice(cart.CartEntries);

  return { ...cart, price };
}
