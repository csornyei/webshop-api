import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { RequestValidationError } from "../error/errors";

export const validatationHandler =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (result.success) {
      next();
    } else {
      throw new RequestValidationError(result.error.issues);
    }
  };
