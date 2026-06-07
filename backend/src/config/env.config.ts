import { DEFAULT_PORT } from "../common/app.constants";

export const envConfig = {
  port: Number(process.env.PORT ?? DEFAULT_PORT),
  database: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? "app",
    password: process.env.DB_PASSWORD ?? "app_pwd",
    database: process.env.DB_NAME ?? "app",
  },
  jwtSecret: process.env.JWT_SECRET ?? "change_me",
};
