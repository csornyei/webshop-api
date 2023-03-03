import { NextFunction, Request, Response } from "express";
import logger from "../log/logger";
import { BaseError } from "./errors";

export function errorHandler(
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction
) {
  if (err instanceof BaseError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  logger.error("unknown error", err);
  return res.status(500).send({
    errors: [{ message: "Something went wrong" }],
  });
}
