import { Request, Response } from "express";
import prisma from "../db";
import { WeatherAlert } from "../types";
import { WEATHER_PARAMETERS, OPERATORS } from "../utils/constants";

export default class AlertController {
  createAlert = async (req: Request, res: Response) => {
    try {
      const alertData: WeatherAlert = req.body;

      // Validate required fields
      if (
        !alertData.locationType ||
        (alertData.locationType === "city" && !alertData.city) ||
        (alertData.locationType === "coords" &&
          (alertData.lat === undefined || alertData.lon === undefined)) ||
        !WEATHER_PARAMETERS.includes(alertData.parameter) ||
        !OPERATORS.includes(alertData.operator)
      ) {
        return res.status(400).json({ error: "Invalid alert data" });
      }

      // Build Prisma-compatible object (exclude evaluations)
      const prismaData = {
        name: alertData.name,
        locationType: alertData.locationType,
        city: alertData.city,
        lat: alertData.lat,
        lon: alertData.lon,
        parameter: alertData.parameter,
        operator: alertData.operator,
        threshold: alertData.threshold,
        description: alertData.description,
      };

      const alert = await prisma.alert.create({ data: prismaData });
      res.status(201).json(alert);
    } catch (error: any) {
      console.error("Failed to create alert:", error);
      res.status(500).json({ error: "Failed to create alert" });
    }
  };

  getAlerts = async (_req: Request, res: Response) => {
    try {
      const alerts = await prisma.alert.findMany({
        include: {
          evaluations: {
            orderBy: { evaluatedAt: "desc" },
            take: 1,
          },
        },
      });
      res.json(alerts);
    } catch (error: any) {
      console.error("Failed to fetch alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  };

  deleteAlert = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.alert.delete({ where: { id } });
      res.status(204).send();
    } catch (error: any) {
      console.error("Failed to delete alert:", error);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  };
}
