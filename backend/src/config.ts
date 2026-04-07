import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().optional(),
  TOMORROW_API_KEY: z.string().default(""),
  TOMORROW_BASE_URL: z.string().default("https://api.tomorrow.io/v4"),
  JWT_SECRET: z.string().default("dev-secret-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  EVALUATION_INTERVAL_MINUTES: z.coerce.number().default(5),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const config = envSchema.parse(process.env);
