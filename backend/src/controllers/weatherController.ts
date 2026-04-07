import { Request, Response } from "express";
import axios from "axios";
import { WeatherService } from "../services/weatherService";
import { LocationValidator } from "../utils/validators";

export default class WeatherController {
  private weatherService: WeatherService;

  constructor() {
    this.weatherService = new WeatherService();
  }

  geocodeSearch = async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string" || q.trim().length < 2) {
        return res.json([]);
      }

      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: q.trim(),
            format: "json",
            addressdetails: 1,
            limit: 8,
            "accept-language": "en",
          },
          headers: {
            "User-Agent": "WeatherAlertSystem/1.0",
          },
          timeout: 5000,
        },
      );

      const results = response.data.map((item: any) => ({
        name: item.display_name,
        shortName:
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.address?.municipality ||
          item.name ||
          item.display_name.split(",")[0],
        country: item.address?.country || "",
        countryCode: item.address?.country_code || "",
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));

      res.json(results);
    } catch (error: any) {
      console.error("Geocode search failed:", error.message);
      res.json([]);
    }
  };

  getRealtimeWeather = async (req: Request, res: Response) => {
    try {
      const { location } = req.query;
      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

      let weatherData;
      const coords = LocationValidator.parseCoordinates(location.toString());

      if (coords) {
        weatherData = await this.weatherService.getWeatherByCoords(
          coords.lat,
          coords.lon,
        );
      } else {
        weatherData = await this.weatherService.getWeatherByCity(
          location.toString(),
        );
      }

      res.json(weatherData);
    } catch (error: any) {
      console.error(
        "Weather fetch failed:",
        error.response?.data || error.message,
      );
      const status = error.response?.status || 500;
      const isUpstreamRateLimit = status === 429;
      res.status(status).json({
        error: isUpstreamRateLimit
          ? "Weather API rate limit exceeded. Please try again shortly."
          : "Failed to fetch weather data",
        code: isUpstreamRateLimit ? "UPSTREAM_RATE_LIMIT" : "FETCH_ERROR",
      });
    }
  };

  getForecastWeather = async (req: Request, res: Response) => {
    try {
      const { location, timestep } = req.query;
      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

      const ts = timestep === "1d" ? "1d" : "1h";
      const forecast = await this.weatherService.getForecast(
        location.toString(),
        ts as "1h" | "1d",
      );

      res.json(forecast);
    } catch (error: any) {
      console.error(
        "Forecast fetch failed:",
        error.response?.data || error.message,
      );
      const status = error.response?.status || 500;
      const isUpstreamRateLimit = status === 429;
      res.status(status).json({
        error: isUpstreamRateLimit
          ? "Weather API rate limit exceeded. Please try again shortly."
          : "Failed to fetch forecast data",
        code: isUpstreamRateLimit ? "UPSTREAM_RATE_LIMIT" : "FETCH_ERROR",
      });
    }
  };

  getWeatherHistory = async (req: Request, res: Response) => {
    try {
      const { location, timestep, range } = req.query;
      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

      const ts = timestep === "1h" ? "1h" : "1d";
      const now = new Date();
      let startTime: Date;

      switch (range) {
        case "24h":
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const history = await this.weatherService.getWeatherHistory(
        location.toString(),
        ts,
        startTime.toISOString(),
        now.toISOString(),
      );

      res.json(history);
    } catch (error: any) {
      console.error(
        "History fetch failed:",
        error.response?.data || error.message,
      );
      const status = error.response?.status || 500;
      const isUpstreamRateLimit = status === 429;
      res.status(status).json({
        error: isUpstreamRateLimit
          ? "Weather API rate limit exceeded. Please try again shortly."
          : "Failed to fetch weather history",
        code: isUpstreamRateLimit ? "UPSTREAM_RATE_LIMIT" : "FETCH_ERROR",
      });
    }
  };
}
