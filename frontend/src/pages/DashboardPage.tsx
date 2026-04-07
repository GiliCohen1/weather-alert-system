import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Bell,
  Cloud,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Thermometer,
  Wind,
  Droplets,
  RefreshCw,
} from "lucide-react";
import { weatherApi } from "../services/api";
import { WeatherData, AlertStats, WeatherAlert } from "../types";
import Card from "../components/ui/Card";
import { SkeletonStat, SkeletonCard } from "../components/ui/Skeleton";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const TOP_CITIES = ["Tel Aviv", "Haifa", "Eilat", "Jerusalem", "Beer Sheva"];

const DashboardPage: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("Tel Aviv");
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [weatherData, statsData, alertsData] = await Promise.all([
        weatherApi.getRealtimeWeather(location),
        weatherApi.getAlertStats(),
        weatherApi.getAlerts(1, 10),
      ]);
      setWeather(weatherData);
      setStats(statsData);
      setAlerts(alertsData.data);
    } catch (err: any) {
      if (!err?._rateLimitHandled) {
        toast.error("Failed to load dashboard data", { id: "dashboard-error" });
      }
    } finally {
      setLoading(false);
    }
  }, [location]);

  const handleEvaluate = useCallback(
    async (id: string) => {
      setEvaluatingId(id);
      try {
        await weatherApi.evaluateAlert(id);
        toast.success("Alert evaluated");
        fetchData();
      } catch (err: any) {
        if (!err?._rateLimitHandled) {
          toast.error("Evaluation failed");
        }
      } finally {
        setEvaluatingId(null);
      }
    },
    [fetchData],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-white" />
          </div>
          Dashboard
        </h1>
        <p className="page-subtitle">
          Real-time overview of your weather monitoring system
        </p>
      </div>

      {/* City selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TOP_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => setLocation(city)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              location === city
                ? "bg-primary-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">Total Alerts</span>
                <Bell className="w-5 h-5 text-primary-500" />
              </div>
              <span className="stat-value">{stats?.totalAlerts ?? 0}</span>
              <span className="text-xs text-gray-400">Configured monitors</span>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">Triggered</span>
                <AlertTriangle className="w-5 h-5 text-danger-500" />
              </div>
              <span className="stat-value text-danger-500">
                {stats?.triggeredCount ?? 0}
              </span>
              <Badge variant={stats?.triggeredCount ? "danger" : "success"} dot>
                {stats?.triggeredCount ? "Action needed" : "All clear"}
              </Badge>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">Active</span>
                <TrendingUp className="w-5 h-5 text-success-500" />
              </div>
              <span className="stat-value text-success-500">
                {stats?.activeCount ?? 0}
              </span>
              <span className="text-xs text-gray-400">Monitoring</span>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">Top Location</span>
                <MapPin className="w-5 h-5 text-secondary-500" />
              </div>
              <span className="stat-value text-lg truncate">
                {stats?.topLocation?.name ?? "-"}
              </span>
              <span className="text-xs text-gray-400">
                {stats?.topLocation
                  ? `${stats.topLocation.count} alert${stats.topLocation.count > 1 ? "s" : ""}`
                  : "No alerts yet"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Weather + Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather Card */}
        <Card hover className="lg:col-span-2 animate-fadeIn">
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Cloud className="w-6 h-6 text-primary-500" />
                Current Weather
              </h2>
              <Badge variant="info">{location}</Badge>
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <SkeletonCard />
            ) : weather ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Thermometer className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {weather.temperature}°
                  </div>
                  <div className="text-sm text-gray-500">Temperature</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Feels like {weather.feelsLike}°C
                  </div>
                </div>

                <div className="text-center">
                  <Wind className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {weather.windSpeed}
                  </div>
                  <div className="text-sm text-gray-500">Wind (m/s)</div>
                </div>

                <div className="text-center">
                  <Droplets className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {weather.humidity}%
                  </div>
                  <div className="text-sm text-gray-500">Humidity</div>
                </div>

                <div className="text-center">
                  <Cloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {weather.precipitationProbability}%
                  </div>
                  <div className="text-sm text-gray-500">Precipitation</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Unable to load weather data
              </p>
            )}
          </Card.Body>
        </Card>

        {/* Quick Info */}
        <Card hover className="animate-slideInRight">
          <Card.Header>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-secondary-500" />
              System Status
            </h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Evaluation Interval
              </span>
              <Badge variant="info">Every 5 min</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Last Evaluation
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {stats?.lastEvaluationAt
                  ? new Date(stats.lastEvaluationAt).toLocaleTimeString()
                  : "Not yet"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                API Provider
              </span>
              <Badge variant="neutral">Tomorrow.io</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                WebSocket
              </span>
              <Badge variant="success" dot>
                Connected
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="mt-6 animate-fadeIn">
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary-500" />
              Recent Alerts
            </h2>
            <Badge variant="neutral">
              {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">
              No alerts configured yet. Create one from the Alerts page.
            </p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const lastEval = alert.evaluations?.[0];
                const isTriggered = lastEval?.triggered;
                const locationText =
                  alert.locationType === "city"
                    ? alert.city
                    : `${alert.lat?.toFixed(2)}, ${alert.lon?.toFixed(2)}`;

                return (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition ${
                      isTriggered
                        ? "border-danger-300 dark:border-danger-700 bg-danger-50/50 dark:bg-danger-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {alert.name || "Unnamed Alert"}
                        </span>
                        {isTriggered ? (
                          <Badge variant="danger" dot>
                            Triggered
                          </Badge>
                        ) : lastEval ? (
                          <Badge variant="success" dot>
                            Normal
                          </Badge>
                        ) : (
                          <Badge variant="neutral">Pending</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {locationText}
                        </span>
                        <span>
                          {alert.parameter} {alert.operator} {alert.threshold}
                        </span>
                        {lastEval && (
                          <span>
                            Value:{" "}
                            <span
                              className={
                                isTriggered ? "text-danger-600 font-medium" : ""
                              }
                            >
                              {lastEval.observedValue}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={evaluatingId === alert.id}
                      onClick={() => alert.id && handleEvaluate(alert.id)}
                      title="Evaluate now"
                    >
                      <RefreshCw
                        size={14}
                        className={
                          evaluatingId === alert.id ? "animate-spin" : ""
                        }
                      />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DashboardPage;
