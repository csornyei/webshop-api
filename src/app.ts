import express from "express";
import "express-async-errors";
import helmet from "helmet";

import routes from "./routes";
import { errorHandler } from "./error/errorMiddleware";
import { NotFoundError } from "./error/errors";
import morganMiddleware from "./log/morganMiddleware";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(morganMiddleware);

app.use("/", routes);

app.use("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
