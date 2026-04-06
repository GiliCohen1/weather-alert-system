import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../db";
import { config } from "../config";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/schemas";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/authMiddleware";
import { NotificationService } from "../services/notificationService";

export default class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, parsed.error.errors[0].message);
      }

      const { name, email, password } = parsed.data;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new AppError(409, "Email already registered");
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
        select: { id: true, name: true, email: true, createdAt: true },
      });

      const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
      } as jwt.SignOptions);

      res.status(201).json({ user, token });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, parsed.error.errors[0].message);
      }

      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new AppError(401, "Invalid email or password");
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new AppError(401, "Invalid email or password");
      }

      const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
      } as jwt.SignOptions);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, parsed.error.errors[0].message);
      }

      const { email } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email } });

      // Always return success to prevent email enumeration
      if (!user) {
        res.json({
          message:
            "If an account with that email exists, a reset link has been sent.",
        });
        return;
      }

      // Invalidate any existing unused tokens for this user
      await prisma.passwordReset.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      });

      // Generate secure reset token
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordReset.create({
        data: { userId: user.id, token, expiresAt },
      });

      // Send reset email
      const notificationService = new NotificationService();
      const result = await notificationService.sendPasswordResetEmail(
        email,
        token,
        user.name,
      );

      const response: Record<string, string> = {
        message:
          "If an account with that email exists, a reset link has been sent.",
      };

      // In development, include the reset URL for easier testing
      if (config.NODE_ENV !== "production" && result.resetUrl) {
        response.resetUrl = result.resetUrl;
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, parsed.error.errors[0].message);
      }

      const { token, newPassword } = parsed.data;

      const resetRecord = await prisma.passwordReset.findUnique({
        where: { token },
        include: { user: true },
      });

      if (
        !resetRecord ||
        resetRecord.used ||
        resetRecord.expiresAt < new Date()
      ) {
        throw new AppError(400, "Invalid or expired reset token");
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetRecord.userId },
          data: { passwordHash },
        }),
        prisma.passwordReset.update({
          where: { id: resetRecord.id },
          data: { used: true },
        }),
      ]);

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      next(error);
    }
  };
}
