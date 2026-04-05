import React, { useState, useCallback, useEffect } from "react";
import {
  Thermometer,
  Wind,
  Droplets,
  Cloud,
  MapPin,
  X,
  Plus,
  TrendingUp,
  History,
} from "lucide-react";
import { weatherApi } from "../services/api";
import { WeatherData, ForecastInterval } from "../types";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import WeatherForecastChart from "../components/charts/WeatherForecastChart";
import CityAutocomplete from "../components/ui/CityAutocomplete";

interface LocationWeather {
  location: string;
  data: WeatherData;
}

const WeatherPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationWeather[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forecast state
  const [forecastData, setForecastData] = useState<ForecastInterval[]>([]);
  const [forecastTimestep, setForecastTimestep] = useState<"1h" | "1d">("1h");
  const [forecastLocation, setForecastLocation] = useState<string>("");
  const [forecastLoading, setForecastLoading] = useState(false);

  // History state
  const [historyData, setHistoryData] = useState<ForecastInterval[]>([]);
  const [historyRange, setHistoryRange] = useState<"24h" | "week" | "month">(
    "week",
  );
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch forecast when location or timestep changes
  useEffect(() => {
    if (!forecastLocation) {
      setForecastData([]);
      return;
    }
    let cancelled = false;
    const fetchForecast = async () => {
      setForecastLoading(true);
      try {
        const res = await weatherApi.getForecast(
          forecastLocation,
          forecastTimestep,
        );
        if (!cancelled) setForecastData(res.intervals);
      } catch {
        if (!cancelled) setForecastData([]);
      } finally {
        if (!cancelled) setForecastLoading(false);
      }
    };
    fetchForecast();
    return () => {
      cancelled = true;
    };
  }, [forecastLocation, forecastTimestep]);

  // Fetch history when forecastLocation or range changes
  useEffect(() => {
    if (!forecastLocation) {
      setHistoryData([]);
      return;
    }
    let cancelled = false;
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const ts = historyRange === "24h" ? "1h" : "1d";
        const res = await weatherApi.getWeatherHistory(
          forecastLocation,
          historyRange,
          ts as "1h" | "1d",
        );
        if (!cancelled) setHistoryData(res.intervals);
      } catch {
        if (!cancelled) setHistoryData([]);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [forecastLocation, historyRange]);

  const addLocation = useCallback(
    async (locationName: string) => {
      if (!locationName.trim()) return;
      if (locations.length >= 3) {
        setError("Maximum 3 locations for comparison");
        return;
      }
      if (
        locations.some(
          (l) => l.location.toLowerCase() === locationName.toLowerCase(),
        )
      ) {
        setError("Location already added");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await weatherApi.getRealtimeWeather(locationName.trim());
        setLocations((prev) => {
          return [...prev, { location: locationName.trim(), data }];
        });
        setForecastLocation(locationName.trim());
        setSearchInput("");
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 429) {
          setError(
            "Rate limit reached - please wait before adding more locations",
          );
        } else if (status === 400) {
          setError(
            "Invalid location. Try a city name or coordinates (e.g. 40.71,-74.00)",
          );
        } else {
          setError(
            "Could not find weather for that location. Check the name and try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [locations],
  );

  const removeLocation = (index: number) => {
    setLocations((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index]?.location === forecastLocation) {
        setForecastLocation(updated[0]?.location || "");
      }
      return updated;
    });
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          Weather Explorer
        </h1>
        <p className="page-subtitle">
          Search and compare weather across up to 3 locations
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1">
          <CityAutocomplete
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
            onSelect={(suggestion) => {
              setSearchInput(suggestion.shortName);
              addLocation(suggestion.shortName);
            }}
            onSubmit={(val) => addLocation(val)}
            placeholder="Search city name or coordinates (e.g. Tel Aviv, 40.71,-74.00)"
            error={error || undefined}
          />
        </div>
        <Button
          type="button"
          variant="primary"
          loading={loading}
          disabled={!searchInput.trim() || locations.length >= 3}
          onClick={() => addLocation(searchInput)}
        >
          <Plus size={18} />
          Add
        </Button>
      </div>

      {/* Quick Add */}
      {locations.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
            Quick add:
          </span>
          {["Tel Aviv", "New York", "London", "Tokyo", "Paris"].map((city) => (
            <button
              key={city}
              onClick={() => addLocation(city)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                         rounded-full hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30
                         transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Weather Cards Grid */}
      {loading && locations.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
        </div>
      ) : locations.length === 0 ? (
        <EmptyState
          variant="weather"
          title="No locations added"
          description="Search for a city above or use the quick-add buttons to start exploring weather conditions"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc, idx) => (
            <Card hover key={loc.location} className="animate-fadeIn">
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    <h3 className="font-bold text-lg">{loc.location}</h3>
                  </div>
                  <button
                    onClick={() => removeLocation(idx)}
                    className="p-1 rounded-lg text-gray-400 hover:text-danger-500 hover:bg-danger-50 transition"
                    aria-label={`Remove ${loc.location}`}
                  >
                    <X size={18} />
                  </button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 dark:text-white">
                    {Math.round(loc.data.temperature)}°
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Feels like {Math.round(loc.data.feelsLike)}°C
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Wind className="w-5 h-5 text-blue-500 mb-1" />
                    <span className="text-sm font-semibold">
                      {loc.data.windSpeed}
                    </span>
                    <span className="text-xs text-gray-400">m/s</span>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Droplets className="w-5 h-5 text-cyan-500 mb-1" />
                    <span className="text-sm font-semibold">
                      {loc.data.humidity}%
                    </span>
                    <span className="text-xs text-gray-400">Humidity</span>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Thermometer className="w-5 h-5 text-orange-500 mb-1" />
                    <span className="text-sm font-semibold">
                      {loc.data.precipitationProbability}%
                    </span>
                    <span className="text-xs text-gray-400">Rain</span>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    Updated: {new Date(loc.data.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge variant="success" dot>
                    Live
                  </Badge>
                </div>
              </Card.Footer>
            </Card>
          ))}

          {/* Add more placeholder */}
          {locations.length < 3 && (
            <button
              onClick={() =>
                document.querySelector<HTMLInputElement>("input")?.focus()
              }
              className="card border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center
                         text-gray-400 hover:text-primary-500 hover:border-primary-500 transition-colors min-h-[280px]"
            >
              <Plus className="w-10 h-10 mb-2" />
              <span className="text-sm font-medium">Add location</span>
              <span className="text-xs mt-1">
                {3 - locations.length} remaining
              </span>
            </button>
          )}
        </div>
      )}

      {/* ── Forecast Section ── */}
      {forecastLocation && (
        <Card className="mt-8 animate-fadeIn">
          <Card.Header>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-500" />
                Weather Forecast
              </h2>
              <div className="flex items-center gap-3">
                {/* Location selector */}
                {locations.length > 1 && (
                  <div className="tab-group">
                    {locations.map((loc) => (
                      <button
                        key={loc.location}
                        onClick={() => setForecastLocation(loc.location)}
                        className={
                          forecastLocation === loc.location
                            ? "tab-item-active"
                            : "tab-item"
                        }
                      >
                        {loc.location}
                      </button>
                    ))}
                  </div>
                )}
                {/* Timestep toggle */}
                <div className="tab-group">
                  <button
                    onClick={() => setForecastTimestep("1h")}
                    className={
                      forecastTimestep === "1h" ? "tab-item-active" : "tab-item"
                    }
                  >
                    Hourly
                  </button>
                  <button
                    onClick={() => setForecastTimestep("1d")}
                    className={
                      forecastTimestep === "1d" ? "tab-item-active" : "tab-item"
                    }
                  >
                    Daily
                  </button>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {forecastTimestep === "1h"
                ? "Hourly forecast - next 5 days"
                : "Daily forecast - next 2 weeks"}
              {forecastLocation && ` for ${forecastLocation}`}
            </p>
          </Card.Header>
          <Card.Body>
            {forecastLoading ? (
              <div className="flex items-center justify-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-primary-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : forecastData.length > 0 ? (
              <WeatherForecastChart
                intervals={forecastData}
                timestep={forecastTimestep}
              />
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                No forecast data available. Try a different location.
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ── Weather History Section ── */}
      <Card className="mt-8 animate-fadeIn">
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="w-6 h-6 text-secondary-500" />
              Weather History
            </h2>
            <div className="tab-group">
              {(
                [
                  { value: "24h", label: "24 Hours" },
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHistoryRange(opt.value)}
                  className={
                    historyRange === opt.value ? "tab-item-active" : "tab-item"
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {forecastLocation && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {historyRange === "24h"
                ? "Hourly data - last 24 hours"
                : historyRange === "week"
                  ? "Daily data - last 7 days"
                  : "Daily data - last 30 days"}
              {` for ${forecastLocation}`}
            </p>
          )}
        </Card.Header>
        <Card.Body>
          {!forecastLocation ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
              Search a city above to view weather history
            </div>
          ) : historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-primary-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : historyData.length > 0 ? (
            <WeatherForecastChart
              intervals={historyData}
              timestep={historyRange === "24h" ? "1h" : "1d"}
            />
          ) : (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
              No history data available. Try a different city or time range.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default WeatherPage;
