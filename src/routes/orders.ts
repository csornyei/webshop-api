import { Router, Request, Response } from "express";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  // create order
  res.status(501).send({ message: "Not implemented" });
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
