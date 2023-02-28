import { Router, Request, Response } from "express";
import { createNewCart } from "../controllers/cart";
import { filterExistingProducts } from "../controllers/product";
import { BadRequestError } from "../error/errors";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
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
});

router.get("/:id", (req: Request, res: Response) => {
  // get order details
  res.status(501).send({ message: "Not implemented" });
});

router.patch("/:id", (req: Request, res: Response) => {
  // update order
  res.status(501).send({ message: "Not implemented" });
});

router.delete("/:id", (req: Request, res: Response) => {
  // delete order
  res.status(501).send({ message: "Not implemented" });
});

router.post("/:id/checkout", (req: Request, res: Response) => {
  // checkout order
  res.status(501).send({ message: "Not implemented" });
});

export default router;
