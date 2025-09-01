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
  evaluatedAt: Date;
  observedValue: number;
  triggered: boolean;
}
