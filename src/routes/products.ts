import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  // product list
  res.status(501).send({ message: "Not implemented" });
});

router.get("/:id", (req: Request, res: Response) => {
  // product details
  res.status(501).send({ message: "Not implemented" });
});

export default router;
