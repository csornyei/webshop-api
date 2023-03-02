import { ZodIssue } from "zod";

export abstract class BaseError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, BaseError.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}

export class NotFoundError extends BaseError {
  statusCode = 404;

  constructor() {
    super("Not found");

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: "Not Found" }];
  }
}

export class BadRequestError extends BaseError {
  statusCode = 400;

  constructor(public message: string) {
    super(message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class RequestValidationError extends BaseError {
  statusCode = 400;

  constructor(private errors: ZodIssue[]) {
    super("Validation error");

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((error) => {
      return { message: error.message, fields: error.path };
    });
  }
}

export class UnauthorizedError extends BaseError {
  statusCode = 401;

  constructor() {
    super("Unauthorized");

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: "Unauthorized" }];
  }
}
