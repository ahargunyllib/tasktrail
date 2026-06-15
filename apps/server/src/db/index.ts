import { drizzle } from "drizzle-orm/libsql";
import { env } from "../env";

export const db = drizzle(env.DB_FILE_NAME, {
  casing: "snake_case",
});
