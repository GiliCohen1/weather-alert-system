// pages/Home.tsx
import React, { useState, useEffect, useCallback } from "react";
import { weatherApi } from "../services/api";
import { WeatherData } from "../types";
import WeatherCard from "../components/WeatherCard";
import LocationForm from "components/LocationForm";

const Home: React.FC = () => {
  const [displayLocation, setDisplayLocation] = useState("Tel Aviv");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (location: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherApi.getRealtimeWeather(location);
      setWeather(data);
      setDisplayLocation(location);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather data.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(displayLocation);
  }, [fetchWeather, displayLocation]);

  return (
    <div className="container">
      <div className="card max-w-md mx-auto">
        {/* Location Input */}
        <LocationForm
          defaultLocation={displayLocation}
          onSubmit={fetchWeather}
          loading={loading}
        />

        {/* Weather Display */}
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : weather ? (
          <WeatherCard location={displayLocation} weather={weather} />
        ) : (
          <div className="text-center">No weather data available</div>
        )}
      </div>
    </div>
  );
};

export default Home;
