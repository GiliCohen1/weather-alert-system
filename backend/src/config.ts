import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  TOMORROW_API_KEY: process.env.TOMORROW_API_KEY || "",
  TOMORROW_BASE_URL:
    process.env.TOMORROW_BASE_URL || "https://api.tomorrow.io/v4",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
};
