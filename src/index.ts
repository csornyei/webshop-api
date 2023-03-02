import dotenv from "dotenv";
import app from "./app";
import logger from "./log/logger";

dotenv.config();

const start = () => {
  const requiredEnvVars = ["PORT", "DATABASE_URL", "JWT_SECRET"];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} is not defined`);
    }
  });

  const { PORT } = process.env;

  app.listen(PORT, () => {
    logger.info(`Server is listening on port ${PORT}`);
  });
};

start();
