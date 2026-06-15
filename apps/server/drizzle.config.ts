import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas.ts",
  dialect: "sqlite",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:local.db",
  },
});
