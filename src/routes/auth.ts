import { Router } from "express";
import { createToken, loginUser, registerUser } from "../controllers/user";
import { BadRequestError } from "../error/errors";
import { loginSchema, registerSchema } from "../validation/schemas";
import { validatationHandler } from "../validation/validationMiddleware";

const router = Router();

router.post("/login", validatationHandler(loginSchema), async (req, res) => {
  const { body } = req;

  const user = await loginUser(body.email, body.password);
  const token = createToken(user);

  res.send({ token });
});

router.post(
  "/register",
  validatationHandler(registerSchema),
  async (req, res) => {
    const { body } = req;

    if (body.password !== body.passwordConfirmation) {
      throw new BadRequestError("Passwords do not match");
    }

    const user = await registerUser(body.email, body.password);
    const token = createToken(user);

    res.send({ token });
  }
);

export default router;
