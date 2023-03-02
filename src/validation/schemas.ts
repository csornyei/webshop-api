import { z } from "zod";

export const createCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().gt(0),
      })
    ),
  }),
});

export const updateCartSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().gte(0),
      })
    ),
  }),
});
