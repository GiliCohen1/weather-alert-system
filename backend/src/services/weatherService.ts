import axios from "axios";
import { config } from "../config";
import { API_UNITS, WEATHER_PARAMETER_KEYS } from "../utils/constants";
import { WeatherData } from "../types";

export class WeatherService {
  private readonly apiKey = config.TOMORROW_API_KEY;
  private readonly baseUrl = config.TOMORROW_BASE_URL;

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    return this.fetchWeather(`${lat},${lon}`);
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    return this.fetchWeather(city);
  }

  private async fetchWeather(location: string): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather/realtime`, {
        params: {
          location,
          apikey: this.apiKey,
          units: API_UNITS,
          fields: Object.values(WEATHER_PARAMETER_KEYS),
        },
      });

      return this.transformWeatherResponse(response.data);
    } catch (error) {
      console.error(
        `Error fetching weather for location "${location}":`,
        error
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
