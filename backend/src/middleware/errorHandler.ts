import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
};
