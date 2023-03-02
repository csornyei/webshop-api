import { User } from "@prisma/client";
import argon2 from "argon2";
import { Request } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../error/errors";

export const registerUser = async (email: string, password: string) => {
  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (userExists) {
    throw new BadRequestError("Email already exists");
  }
  const hash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
    },
  });
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new NotFoundError();
  }
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new NotFoundError();
  }
  return user;
};

export const createToken = (user: User) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET!
  );

  return token;
};

export const getTokenFromRequest = (req: Request) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new UnauthorizedError();
  }

  const token = authorization.split(" ")[1];

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
    id: string;
    email: string;
  };

  return payload;
};

const hashPassword = async (password: string) => {
  const hash = await argon2.hash(password, {
    memoryCost: 2 ** 16,
  });
  return hash;
};

const comparePassword = async (password: string, hash: string) => {
  const isValid = await argon2.verify(hash, password);
  return isValid;
};
