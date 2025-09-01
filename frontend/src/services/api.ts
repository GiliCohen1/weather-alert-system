import axios from "axios";
import { WeatherAlert, WeatherData } from "../types";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const weatherApi = {
  getRealtimeWeather: async (location: string): Promise<WeatherData> => {
    const response = await api.get(
      `/weather/realtime?location=${encodeURIComponent(location)}`
    );
    return response.data;
  },

  createAlert: async (
    alert: Omit<WeatherAlert, "id">
  ): Promise<WeatherAlert> => {
    const response = await api.post("/alerts", alert);
    return response.data;
  },

  getAlerts: async (): Promise<WeatherAlert[]> => {
    const response = await api.get("/alerts");
    return response.data;
  },

  deleteAlert: async (id: string): Promise<void> => {
    await api.delete(`/alerts/${id}`);
  },
};
