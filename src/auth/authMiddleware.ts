import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database";
import { UnauthorizedError } from "../error/errors";

export const authMiddleware = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new UnauthorizedError();
  }
  const token = authorization.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user || user.email !== payload.email) {
      throw new UnauthorizedError();
    }

    next();
  } catch (error) {
    throw new UnauthorizedError();
  }
};
