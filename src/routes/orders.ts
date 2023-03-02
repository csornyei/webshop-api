import { Router, Request, Response } from "express";
import { authMiddleware } from "../auth/authMiddleware";
import {
  cancelCart,
  checkoutCart,
  createNewCart,
  getCart,
  updateCart,
} from "../controllers/cart";
import { filterExistingProducts } from "../controllers/product";
import { getTokenFromRequest } from "../controllers/user";
import { BadRequestError, UnauthorizedError } from "../error/errors";
import { createCartSchema, updateCartSchema } from "../validation/schemas";
import { validatationHandler } from "../validation/validationMiddleware";

const router = Router();

router.post(
  "/",
  validatationHandler(createCartSchema),
  authMiddleware,
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

    const { id } = getTokenFromRequest(req);

    const cart = await createNewCart(existingItems, id);

    res.send(cart);
  }
);

router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const cart = await getCart(id);

  const { id: userId } = getTokenFromRequest(req);
  if (cart.userId !== userId) {
    throw new UnauthorizedError();
  }
  res.send(cart);
});

router.patch(
  "/:id",
  validatationHandler(updateCartSchema),
  authMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { items } = req.body;

    const cart = await getCart(id);

    const { id: userId } = getTokenFromRequest(req);
    if (cart.userId !== userId) {
      throw new UnauthorizedError();
    }

    const updatedCart = await updateCart(id, items);

    res.send(updatedCart);
  }
);

router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const oldCart = await getCart(id);
  const { id: userId } = getTokenFromRequest(req);
  if (oldCart.userId !== userId) {
    throw new UnauthorizedError();
  }
  const cart = await cancelCart(id);
  res.send(cart);
});

router.post(
  "/:id/checkout",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const openCart = await getCart(id);
    const { id: userId } = getTokenFromRequest(req);
    if (openCart.userId !== userId) {
      throw new UnauthorizedError();
    }
    if (openCart.status !== "OPEN") {
      throw new BadRequestError("Cart is not open");
    }
    if (openCart.CartEntries.length === 0) {
      throw new BadRequestError("Cart is empty");
    }
    const cart = await checkoutCart(id);
    res.send(cart);
  }
);

export default router;
