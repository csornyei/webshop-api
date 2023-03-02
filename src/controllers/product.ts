import { Product } from "@prisma/client";
import prisma from "../database";
import { NotFoundError } from "../error/errors";

function convertPrice(product: Partial<Product>) {
  return {
    ...product,
    price: product.price ? product.price / 100 : 0,
  };
}

export async function listProducts(limit: number, offset: number, q: string) {
  const product = await prisma.product.findMany({
    take: limit,
    skip: offset,
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  return product.map(convertPrice).filter(({ price }) => price > 0);
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      category: true,
      categoryId: true,
    },
  });

  if (!product) {
    throw new NotFoundError();
  }

  return convertPrice(product);
}

export async function filterExistingProducts(
  items: { productId: string; quantity: number }[]
) {
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: items.map((item) => item.productId),
      },
    },
  });

  return items.filter(
    (product) => products.findIndex((p) => p.id === product.productId) !== -1
  );
}

export async function calculatePrice(
  items: {
    product: {
      name: string;
      price: number;
    };
    productId: string;
    quantity: number;
  }[]
) {
  return items.reduce((total, item) => {
    const { product } = item;

    return total + convertPrice(product).price * item.quantity;
  }, 0);
}
