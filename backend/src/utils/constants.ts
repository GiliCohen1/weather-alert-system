export const WEATHER_PARAMETERS = [
  "temperature",
  "windSpeed",
  "precipitationProbability",
  "humidity",
  "temperatureApparent",
] as const;

export type WeatherParameter = (typeof WEATHER_PARAMETERS)[number];

export const WEATHER_PARAMETER_KEYS: Record<WeatherParameter, string> = {
  temperature: "temperature",
  windSpeed: "windSpeed",
  precipitationProbability: "precipitationProbability",
  humidity: "humidity",
  temperatureApparent: "temperatureApparent",
};

export const OPERATORS = [">", ">=", "<", "<=", "=="] as const;
export type Operator = (typeof OPERATORS)[number];

export const DEFAULT_EVALUATION_INTERVAL_MINUTES = 5;
export const DEFAULT_LOCATION = "Tel Aviv";
export const TIMEZONE = "Asia/Jerusalem";
export const API_UNITS = "metric";
