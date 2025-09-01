import {
  WeatherAlert,
  AlertEvaluation,
  AlertNotificationPayload,
} from "../types";
import { WeatherService } from "./weatherService";
import { NotificationService } from "./notificationService";
import prisma from "../db";
import schedule from "node-schedule";
import {
  WEATHER_PARAMETER_KEYS,
  DEFAULT_EVALUATION_INTERVAL_MINUTES,
  TIMEZONE,
} from "../utils/constants";

export class AlertEvaluationService {
  private weatherService: WeatherService;
  private notificationService: NotificationService;
  private prisma = prisma;
  private job: schedule.Job | null = null;

  constructor() {
    this.weatherService = new WeatherService();
    this.notificationService = new NotificationService();
    this.prisma = prisma;
  }

  /** Evaluate a single alert and store the result in the database */
  async evaluateAlert(alert: WeatherAlert): Promise<AlertEvaluation> {
    const weatherData =
      alert.locationType === "coords"
        ? await this.weatherService.getWeatherByCoords(alert.lat!, alert.lon!)
        : await this.weatherService.getWeatherByCity(alert.city!);

    const mappedKey = WEATHER_PARAMETER_KEYS[alert.parameter];
    const rawValue = weatherData[mappedKey as keyof typeof weatherData];

    // Ensure observedValue is a number
    const observedValue = Number(rawValue);
    if (isNaN(observedValue)) {
      throw new Error(
        `Observed value for ${alert.parameter} is not a valid number: ${rawValue}`
      );
    }

    const triggered = this.evaluateCondition(
      observedValue,
      alert.operator,
      alert.threshold
    );

    return await this.prisma.alertEvaluation.create({
      data: {
        alertId: alert.id!,
        evaluatedAt: new Date(),
        observedValue,
        triggered,
      },
    });
  }

  /** Evaluate condition using operator constants */
  private evaluateCondition(
    value: number,
    operator: string,
    threshold: number
  ): boolean {
    switch (operator) {
      case ">":
        return value > threshold;
      case ">=":
        return value >= threshold;
      case "<":
        return value < threshold;
      case "<=":
        return value <= threshold;
      case "==":
        return value === threshold;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  /** Run scheduled evaluation using node-schedule */
  async startScheduledEvaluation(
    intervalMinutes: number = DEFAULT_EVALUATION_INTERVAL_MINUTES
  ) {
    if (this.job) this.job.cancel();

    this.job = schedule.scheduleJob(
      `*/${intervalMinutes} * * * *`,
      async () => {
        const israelTime = new Date().toLocaleString("en-US", {
          timeZone: TIMEZONE,
        });
        console.log(`Running scheduled evaluation at ${israelTime}`);

        try {
          const alerts = await this.prisma.alert.findMany({
            include: {
              evaluations: { orderBy: { evaluatedAt: "desc" }, take: 1 },
            },
          });

          for (const alert of alerts) {
            try {
              const weatherAlert = this.mapPrismaAlert(alert);
              const evaluation = await this.evaluateAlert(weatherAlert);

              // Notify if state changed
              const previousState = alert.evaluations[0]?.triggered;
              if (
                evaluation.triggered &&
                previousState !== evaluation.triggered
              ) {
                await this.notificationService.sendAlertNotification(
                  this.buildNotificationPayload(weatherAlert, evaluation)
                );
              }
            } catch (error) {
              console.error(`Failed to evaluate alert ${alert.id}:`, error);
            }
          }
        } catch (error) {
          console.error("Failed to run scheduled evaluation:", error);
        }
      }
    );
  }

  stopScheduledEvaluation() {
    if (this.job) {
      this.job.cancel();
      this.job = null;
    }
  }

  /** Convert Prisma alert model to WeatherAlert type */
  private mapPrismaAlert(alert: any): WeatherAlert {
    return {
      id: alert.id,
      name: alert.name ?? undefined,
      locationType: alert.locationType as "city" | "coords",
      city: alert.city ?? undefined,
      lat: alert.lat ?? undefined,
      lon: alert.lon ?? undefined,
      parameter: alert.parameter as keyof typeof WEATHER_PARAMETER_KEYS,
      operator: alert.operator,
      threshold: alert.threshold,
      description: alert.description ?? undefined,
    };
  }

  /** Build notification payload */
  private buildNotificationPayload(
    alert: WeatherAlert,
    evaluation: AlertEvaluation
  ): AlertNotificationPayload {
    return {
      id: alert.id!,
      name: alert.name,
      parameter: alert.parameter,
      threshold: alert.threshold,
      observedValue: evaluation.observedValue,
    };
  }
}
