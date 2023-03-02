import { Request, Response, NextFunction } from "express";
import { getTokenFromRequest } from "../controllers/user";
import prisma from "../database";
import { UnauthorizedError } from "../error/errors";

export const authMiddleware = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const payload = getTokenFromRequest(req);

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
