import axios from "axios";
import { config } from "../config";
import { API_UNITS, WEATHER_PARAMETER_KEYS } from "../utils/constants";
import { WeatherData, ForecastInterval, ForecastResponse } from "../types";

export class WeatherService {
  private readonly apiKey = config.TOMORROW_API_KEY;
  private readonly baseUrl = config.TOMORROW_BASE_URL;

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    return this.fetchWeather(`${lat},${lon}`);
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    return this.fetchWeather(city);
  }

  async getForecast(
    location: string,
    timestep: "1h" | "1d" = "1h",
  ): Promise<ForecastResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather/forecast`, {
        params: {
          location,
          apikey: this.apiKey,
          units: API_UNITS,
          timesteps: timestep,
          fields: Object.values(WEATHER_PARAMETER_KEYS).join(","),
        },
      });

      const timelines = response.data.timelines;
      const timeline =
        (timestep === "1d" ? timelines?.daily : timelines?.hourly) ??
        timelines?.daily ??
        timelines?.hourly ??
        [];

      const intervals: ForecastInterval[] = timeline.map((item: any) => ({
        time: item.time,
        temperature:
          item.values?.temperature ?? item.values?.temperatureAvg ?? 0,
        temperatureApparent:
          item.values?.temperatureApparent ??
          item.values?.temperatureApparentAvg ??
          0,
        windSpeed: item.values?.windSpeed ?? item.values?.windSpeedAvg ?? 0,
        humidity: item.values?.humidity ?? item.values?.humidityAvg ?? 0,
        precipitationProbability:
          item.values?.precipitationProbability ??
          item.values?.precipitationProbabilityAvg ??
          0,
      }));

      return { location, timestep, intervals };
    } catch (error) {
      console.error(`Error fetching forecast for "${location}":`, error);
      throw error;
    }
  }

  async getWeatherHistory(
    location: string,
    timestep: "1h" | "1d",
    startTime: string,
    endTime: string,
  ): Promise<ForecastResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/weather/history/recent`,
        {
          params: {
            location,
            apikey: this.apiKey,
            units: API_UNITS,
            timesteps: timestep,
            fields: Object.values(WEATHER_PARAMETER_KEYS).join(","),
            startTime,
            endTime,
          },
        },
      );

      const timelines = response.data.timelines;
      const timeline =
        (timestep === "1d" ? timelines?.daily : timelines?.hourly) ??
        timelines?.daily ??
        timelines?.hourly ??
        [];

      const intervals: ForecastInterval[] = timeline.map((item: any) => ({
        time: item.time,
        temperature:
          item.values?.temperature ?? item.values?.temperatureAvg ?? 0,
        temperatureApparent:
          item.values?.temperatureApparent ??
          item.values?.temperatureApparentAvg ??
          0,
        windSpeed: item.values?.windSpeed ?? item.values?.windSpeedAvg ?? 0,
        humidity: item.values?.humidity ?? item.values?.humidityAvg ?? 0,
        precipitationProbability:
          item.values?.precipitationProbability ??
          item.values?.precipitationProbabilityAvg ??
          0,
      }));

      return { location, timestep, intervals };
    } catch (error) {
      console.error(`Error fetching history for "${location}":`, error);
      throw error;
    }
  }

  private async fetchWeather(location: string): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather/realtime`, {
        params: {
          location,
          apikey: this.apiKey,
          units: API_UNITS,
          fields: Object.values(WEATHER_PARAMETER_KEYS).join(","),
        },
      });

      return this.transformWeatherResponse(response.data);
    } catch (error) {
      console.error(
        `Error fetching weather for location "${location}":`,
        error,
      );
      throw error;
    }
  }

  private transformWeatherResponse(data: any): WeatherData {
    const values = data.data.values;
    return {
      temperature: values[WEATHER_PARAMETER_KEYS.temperature],
      feelsLike: values[WEATHER_PARAMETER_KEYS.temperatureApparent],
      windSpeed: values[WEATHER_PARAMETER_KEYS.windSpeed],
      humidity: values[WEATHER_PARAMETER_KEYS.humidity],
      precipitationProbability:
        values[WEATHER_PARAMETER_KEYS.precipitationProbability],
      timestamp: data.data.time,
    };
  }
}
