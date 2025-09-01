import { WeatherParameter, Operator } from "../utils/constants";

export interface AlertEvaluation {
  id?: string;
  alertId: string;
  evaluatedAt: Date;
  observedValue: number;
  triggered: boolean;
}

export interface WeatherAlert {
  id?: string;
  name?: string;
  locationType: "city" | "coords";
  city?: string;
  lat?: number;
  lon?: number;
  parameter: WeatherParameter;
  operator: Operator;
  threshold: number;
  description?: string;
  evaluations?: AlertEvaluation[];
  createdAt?: string;
}

export interface EvaluationResult {
  alertId: string;
  observedValue: number;
  triggered: boolean;
}

export interface AlertNotificationPayload {
  id: string;
  name?: string;
  parameter: WeatherParameter;
  threshold: number;
  observedValue: number;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  humidity: number;
  precipitationProbability: number;
  timestamp: string;
}
