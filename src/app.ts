import express, { Request, Response } from "express";
import helmet from "helmet";

const app = express();
app.use(helmet());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Welcome to Webshop API!" });
});

export default app;
