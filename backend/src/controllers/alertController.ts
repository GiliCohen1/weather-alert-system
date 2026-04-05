import { Request, Response, NextFunction } from "express";
import prisma from "../db";
import { createAlertSchema, paginationSchema } from "../utils/schemas";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../middleware/errorHandler";
import { SocketService } from "../services/socketService";
import { AlertEvaluationService } from "../services/alertEvaluationService";

const alertEvaluationService = new AlertEvaluationService();

export default class AlertController {
  createAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = createAlertSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, parsed.error.errors[0].message);
      }

      const data = parsed.data;

      const alert = await prisma.alert.create({
        data: {
          name: data.name,
          locationType: data.locationType,
          city: data.city,
          lat: data.lat,
          lon: data.lon,
          parameter: data.parameter,
          operator: data.operator,
          threshold: data.threshold,
          description: data.description,
          userId: req.userId || null,
        },
      });

      // Emit real-time event
      SocketService.getInstance().emitAlertCreated({
        id: alert.id,
        name: alert.name ?? undefined,
        userId: alert.userId ?? undefined,
      });

      // Immediately evaluate the new alert so it doesn't stay "Pending"
      try {
        await alertEvaluationService.evaluateSingleAlert(alert.id);
      } catch (evalErr) {
        console.error("Immediate evaluation failed:", evalErr);
      }

      // Fetch the alert with its evaluation to return fresh data
      const freshAlert = await prisma.alert.findUnique({
        where: { id: alert.id },
        include: {
          evaluations: { orderBy: { evaluatedAt: "desc" }, take: 1 },
        },
      });

      res.status(201).json(freshAlert);
    } catch (error) {
      next(error);
    }
  };

  getAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const skip = (page - 1) * limit;

      const where = req.userId
        ? { OR: [{ userId: req.userId }, { userId: null }] }
        : {};

      const [alerts, total] = await Promise.all([
        prisma.alert.findMany({
          where,
          include: {
            evaluations: {
              orderBy: { evaluatedAt: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.alert.count({ where }),
      ]);

      res.json({
        data: alerts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getAlertStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const where = req.userId
        ? { OR: [{ userId: req.userId }, { userId: null }] }
        : {};

      const [totalAlerts, alertsWithEvals] = await Promise.all([
        prisma.alert.count({ where }),
        prisma.alert.findMany({
          where,
          include: {
            evaluations: {
              orderBy: { evaluatedAt: "desc" },
              take: 1,
            },
          },
        }),
      ]);

      const triggeredCount = alertsWithEvals.filter(
        (a) => a.evaluations[0]?.triggered === true,
      ).length;

      const lastEvaluation = alertsWithEvals
        .flatMap((a) => a.evaluations)
        .sort(
          (a, b) =>
            new Date(b.evaluatedAt).getTime() -
            new Date(a.evaluatedAt).getTime(),
        )[0];

      // Most monitored locations
      const locationCounts: Record<string, number> = {};
      for (const alert of alertsWithEvals) {
        const loc =
          alert.locationType === "city"
            ? alert.city || "Unknown"
            : `${alert.lat},${alert.lon}`;
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      }
      const topLocation = Object.entries(locationCounts).sort(
        (a, b) => b[1] - a[1],
      )[0];

      res.json({
        totalAlerts,
        triggeredCount,
        activeCount: totalAlerts - triggeredCount,
        lastEvaluationAt: lastEvaluation?.evaluatedAt || null,
        topLocation: topLocation
          ? { name: topLocation[0], count: topLocation[1] }
          : null,
      });
    } catch (error) {
      next(error);
    }
  };

  getAlertHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { page, limit } = paginationSchema.parse(req.query);
      const skip = (page - 1) * limit;

      const [evaluations, total] = await Promise.all([
        prisma.alertEvaluation.findMany({
          where: { alertId: id },
          orderBy: { evaluatedAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.alertEvaluation.count({ where: { alertId: id } }),
      ]);

      res.json({
        data: evaluations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await prisma.alert.delete({ where: { id } });
      SocketService.getInstance().emitAlertDeleted(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  evaluateAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const evaluation = await alertEvaluationService.evaluateSingleAlert(id);
      res.json(evaluation);
    } catch (error) {
      next(error);
    }
  };
}
