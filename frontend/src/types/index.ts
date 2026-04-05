export interface WeatherAlert {
  id?: string;
  name?: string;
  locationType: "city" | "coords";
  city?: string;
  lat?: number;
  lon?: number;
  parameter:
    | "temperature"
    | "windSpeed"
    | "precipitationProbability"
    | "humidity"
    | "temperatureApparent";
  operator: ">" | ">=" | "<" | "<=" | "==";
  threshold: number;
  description?: string;
  triggered?: boolean;
  userId?: string;
  evaluations?: AlertEvaluation[];
  createdAt?: string;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  humidity: number;
  precipitationProbability: number;
  timestamp: string;
}

export interface AlertEvaluation {
  id: string;
  alertId: string;
  evaluatedAt: string;
  observedValue: number;
  triggered: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AlertStats {
  totalAlerts: number;
  triggeredCount: number;
  activeCount: number;
  lastEvaluationAt: string | null;
  topLocation: { name: string; count: number } | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Notification {
  id: string;
  userId: string;
  alertId: string;
  message: string;
  read: boolean;
  createdAt: string;
  alert?: { id: string; name: string; parameter: string };
}

export interface ForecastInterval {
  time: string;
  temperature: number;
  temperatureApparent: number;
  windSpeed: number;
  humidity: number;
  precipitationProbability: number;
}

export interface ForecastResponse {
  location: string;
  timestep: "1h" | "1d";
  intervals: ForecastInterval[];
}
