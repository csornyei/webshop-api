import { NextFunction, Request, Response } from "express";
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

  console.error("Unknown error", err);
  return res.status(500).send({
    errors: [{ message: "Something went wrong" }],
  });
}
