import { Request, Response } from "express";
import { WeatherService } from "../services/weatherService";
import { LocationValidator } from "../utils/validators";

export default class WeatherController {
  private weatherService: WeatherService;

  constructor() {
    this.weatherService = new WeatherService();
  }

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
          coords.lon
        );
      } else {
        weatherData = await this.weatherService.getWeatherByCity(
          location.toString()
        );
      }

      res.json(weatherData);
    } catch (error: any) {
      console.error(
        "Weather fetch failed:",
        error.response?.data || error.message
      );
      res.status(error.response?.status || 500).json({
        error: "Failed to fetch weather data",
        details: error.response?.data || error.message,
      });
    }
  };
}
