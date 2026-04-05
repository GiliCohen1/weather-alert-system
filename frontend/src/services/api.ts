import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  WeatherAlert,
  WeatherData,
  AuthResponse,
  User,
  PaginatedResponse,
  AlertStats,
  AlertEvaluation,
  Notification,
  ForecastResponse,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Rate-limit tracking =====
let rateLimitToastId: string | undefined;
let rateLimitUntil = 0;

export const isRateLimited = () => Date.now() < rateLimitUntil;

// Response interceptor — handle 429 with informative toasts
api.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      message?: string;
      code?: string;
      retryAfterSeconds?: number;
    }>,
  ) => {
    if (error.response?.status === 429) {
      const data = error.response.data;
      const retryAfterHeader = error.response.headers["retry-after"];
      const retrySeconds =
        data?.retryAfterSeconds ||
        (retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60);

      rateLimitUntil = Date.now() + retrySeconds * 1000;

      const isUpstream = data?.code === "UPSTREAM_RATE_LIMIT";
      const isWeather = data?.code === "WEATHER_RATE_LIMIT";
      const isAuth = data?.code === "AUTH_RATE_LIMIT";

      let title: string;
      let description: string;

      if (isUpstream) {
        title = "Weather Provider Limit";
        description =
          "The weather data provider is temporarily unavailable. Please try again in a few minutes.";
      } else if (isWeather) {
        title = "Weather Request Limit";
        description = `You've made too many weather requests. Please wait ~${Math.ceil(retrySeconds / 60)} minute(s).`;
      } else if (isAuth) {
        title = "Login Attempt Limit";
        description =
          "Too many login attempts. Please wait before trying again.";
      } else {
        title = "Request Limit Reached";
        description =
          data?.message ||
          `Too many requests. Please wait ~${Math.ceil(retrySeconds / 60)} minute(s).`;
      }

      // Dismiss previous rate limit toast to avoid stacking
      if (rateLimitToastId) toast.dismiss(rateLimitToastId);

      rateLimitToastId = toast.error(`${title}\n${description}`, {
        duration: Math.min(retrySeconds * 1000, 15000),
        id: "rate-limit-toast",
        style: { maxWidth: 420 },
      });

      // Mark as handled so downstream catch blocks don't show duplicate toasts
      (error as any)._rateLimitHandled = true;
    }

    return Promise.reject(error);
  },
);

// ===== Auth =====
export const authApi = {
  register: async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

// ===== Weather =====
export interface GeocodeSuggestion {
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
}

export const weatherApi = {
  getRealtimeWeather: async (location: string): Promise<WeatherData> => {
    const { data } = await api.get(
      `/weather/realtime?location=${encodeURIComponent(location)}`,
    );
    return data;
  },

  geocodeSearch: async (query: string): Promise<GeocodeSuggestion[]> => {
    if (query.trim().length < 2) return [];
    const { data } = await api.get(`/geocode?q=${encodeURIComponent(query)}`);
    return data;
  },

  getForecast: async (
    location: string,
    timestep: "1h" | "1d" = "1h",
  ): Promise<ForecastResponse> => {
    const { data } = await api.get(
      `/weather/forecast?location=${encodeURIComponent(location)}&timestep=${timestep}`,
    );
    return data;
  },

  getWeatherHistory: async (
    location: string,
    range: "24h" | "week" | "month" = "week",
    timestep: "1h" | "1d" = "1d",
  ): Promise<ForecastResponse> => {
    const { data } = await api.get(
      `/weather/history?location=${encodeURIComponent(location)}&range=${range}&timestep=${timestep}`,
    );
    return data;
  },

  // ===== Alerts =====
  createAlert: async (
    alert: Omit<WeatherAlert, "id">,
  ): Promise<WeatherAlert> => {
    const { data } = await api.post("/alerts", alert);
    return data;
  },

  getAlerts: async (
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<WeatherAlert>> => {
    const { data } = await api.get(`/alerts?page=${page}&limit=${limit}`);
    return data;
  },

  getAlertStats: async (): Promise<AlertStats> => {
    const { data } = await api.get("/alerts/stats");
    return data;
  },

  getAlertHistory: async (
    id: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedResponse<AlertEvaluation>> => {
    const { data } = await api.get(
      `/alerts/${id}/history?page=${page}&limit=${limit}`,
    );
    return data;
  },

  deleteAlert: async (id: string): Promise<void> => {
    await api.delete(`/alerts/${id}`);
  },

  evaluateAlert: async (id: string): Promise<AlertEvaluation> => {
    const { data } = await api.post(`/alerts/${id}/evaluate`);
    return data;
  },
};

// ===== Notifications =====
export const notificationApi = {
  getNotifications: async (): Promise<{
    notifications: Notification[];
    unreadCount: number;
  }> => {
    const { data } = await api.get("/notifications");
    return data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async (): Promise<{ count: number }> => {
    const { data } = await api.patch("/notifications/read-all");
    return data;
  },
};
