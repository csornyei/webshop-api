import { Router, Request, Response } from "express";
import {
  cancelCart,
  checkoutCart,
  createNewCart,
  getCart,
  updateCart,
} from "../controllers/cart";
import { filterExistingProducts } from "../controllers/product";
import { BadRequestError } from "../error/errors";
import { createCartSchema, updateCartSchema } from "../validation/schemas";
import { validatationHandler } from "../validation/validationMiddleware";

const router = Router();

router.post(
  "/",
  validatationHandler(createCartSchema),
  async (req: Request, res: Response) => {
    const { items }: { items: { productId: string; quantity: number }[] } =
      req.body;

    if (!items || !items.length) {
      throw new BadRequestError("Items are required");
    }

    const existingItems = await filterExistingProducts(items);

    if (existingItems.length === 0) {
      throw new BadRequestError("No valid items");
    }

    const cart = await createNewCart(existingItems);

    res.send(cart);
  }
);

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const cart = await getCart(id);
  res.send(cart);
});

router.patch(
  "/:id",
  validatationHandler(updateCartSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { items } = req.body;

    await getCart(id);

    const updatedCart = await updateCart(id, items);

    res.send(updatedCart);
  }
);

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await getCart(id);
  const cart = await cancelCart(id);
  res.send(cart);
});

router.post("/:id/checkout", async (req: Request, res: Response) => {
  const { id } = req.params;
  const openCart = await getCart(id);
  if (openCart.status !== "OPEN") {
    throw new BadRequestError("Cart is not open");
  }
  if (openCart.CartEntries.length === 0) {
    throw new BadRequestError("Cart is empty");
  }
  const cart = await checkoutCart(id);
  res.send(cart);
});

export default router;
