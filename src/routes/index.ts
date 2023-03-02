import { Router, Request, Response } from "express";
import productsRouter from "./products";
import orderRouter from "./orders";
import authRouter from "./auth";

const router = Router();

router.get("/", (_: Request, res: Response) => {
  res.send({ message: "Welcome to Webshop API!" });
});

router.use("/api/products", productsRouter);
router.use("/api/orders", orderRouter);
router.use("/api/auth", authRouter);

export default router;
