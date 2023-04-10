import dotenv from "dotenv";
import path from "path";

export const MODE = process.env.NODE_ENV;

dotenv.config({
  path: path.join(path.resolve(), ".env"),
});
dotenv.config({
  path: path.join(path.resolve(), `.env.${MODE}`),
});

export const PORT = Number(process.env.PORT) || 4000;
