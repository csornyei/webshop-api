import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const start = () => {
  const requiredEnvVars = ["PORT"];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} is not defined`);
    }
  });

  const { PORT } = process.env;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
