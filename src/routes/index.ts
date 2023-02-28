import { Router, Request, Response } from "express";
import productsRouter from "./products";
import orderRouter from "./orders";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send({ message: "Welcome to Webshop API!" });
});

router.use("/api/products", productsRouter);
router.use("/api/orders", orderRouter);

export default router;
