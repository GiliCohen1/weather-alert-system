import { z } from "zod";

// ===== Auth Schemas =====
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ===== Alert Schemas =====
const locationTypeSchema = z.enum(["city", "coords"]);

export const createAlertSchema = z
  .object({
    name: z.string().max(200).optional(),
    locationType: locationTypeSchema,
    city: z.string().max(200).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lon: z.number().min(-180).max(180).optional(),
    parameter: z.enum([
      "temperature",
      "windSpeed",
      "precipitationProbability",
      "humidity",
      "temperatureApparent",
    ]),
    operator: z.enum([">", ">=", "<", "<=", "=="]),
    threshold: z.number(),
    description: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.locationType === "city") return !!data.city;
      return data.lat !== undefined && data.lon !== undefined;
    },
    {
      message: "City required for city type, lat/lon required for coords type",
    },
  );

// ===== Query Schemas =====
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const locationQuerySchema = z.object({
  location: z.string().min(1, "Location is required"),
});

// ===== Password Reset Schemas =====
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
