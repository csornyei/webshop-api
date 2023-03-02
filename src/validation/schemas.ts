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

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/);

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordSchema,
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordSchema,
    passwordConfirmation: passwordSchema,
  }),
});
