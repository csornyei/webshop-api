import { Router, Request, Response } from "express";
import { getProduct, listProducts } from "../controllers/product";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  let limit = 20;
  if (req.query.limit) {
    limit = parseInt(req.query.limit as string);
  }
  let offset = 0;
  if (req.query.offset) {
    offset = parseInt(req.query.offset as string);
  }
  let q = "";
  if (req.query.q) {
    q = req.query.q as string;
  }
  const products = await listProducts(limit, offset, q);
  res.send(products);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const product = await getProduct(id);

  res.send(product);
});

export default router;
