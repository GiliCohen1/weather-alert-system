import rateLimit from "express-rate-limit";

/** General API rate limiter - 100 requests per 15 minutes */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    code: "RATE_LIMIT",
    message: "Too many requests. Please try again later.",
    retryAfterSeconds: 60,
  },
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({
      status: "error",
      code: "RATE_LIMIT",
      message: `Too many requests - limit is ${options.max} per ${options.windowMs / 60000} minutes. Please wait before trying again.`,
      retryAfterSeconds: retryAfter,
    });
  },
});

/** Stricter limiter for auth endpoints - 10 attempts per 15 minutes */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({
      status: "error",
      code: "AUTH_RATE_LIMIT",
      message:
        "Too many authentication attempts. Please wait before trying again.",
      retryAfterSeconds: retryAfter,
    });
  },
});

/** Weather endpoint limiter - 25 requests per 15 minutes (protects Tomorrow.io quota) */
export const weatherLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({
      status: "error",
      code: "WEATHER_RATE_LIMIT",
      message: `Weather API request limit reached (${options.max} per ${options.windowMs / 60000} min). Please wait before checking weather again.`,
      retryAfterSeconds: retryAfter,
    });
  },
});
