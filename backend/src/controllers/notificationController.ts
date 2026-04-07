import { Response, NextFunction } from "express";
import prisma from "../db";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../middleware/errorHandler";

export default class NotificationController {
  getNotifications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.userId!;

      const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            alert: {
              select: { id: true, name: true, parameter: true },
            },
          },
        }),
        prisma.notification.count({
          where: { userId, read: false },
        }),
      ]);

      res.json({ notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const notification = await prisma.notification.findUnique({
        where: { id },
      });
      if (!notification || notification.userId !== userId) {
        throw new AppError(404, "Notification not found");
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.userId!;

      const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });

      res.json({ count: result.count });
    } catch (error) {
      next(error);
    }
  };
}
