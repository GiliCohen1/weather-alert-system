import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";
import { config } from "../config";
import { registerSchema, loginSchema } from "../utils/schemas";
import { AppError } from "../middleware/errorHandler";

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
      const userId = (req as any).userId;
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
}
