import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

export default defineConfig(({ command, mode, ssrBuild }) => {
  const env = loadEnv(mode, process.cwd(), "");
  dotenv.config({
    path: path.join(path.resolve(), ".env"),
  });
  dotenv.config({
    path: path.join(path.resolve(), `.env.${mode}`),
  });
  console.log(mode);
  console.log(process.env.PORT);
  return {
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    server: {
      host: process.env.HOST,
      port: Number(process.env.PORT) || 3000,
      proxy: {
        // "/api": {
        //   target: 'http://localhost:'
        //   rewrite(path) {
        //     return path.replace(/\/api/, "");
        //   },
        // },
      },
    },
    base: "",
    plugins: [react()],
  };
});
