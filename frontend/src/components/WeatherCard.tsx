import React from "react";
import { WeatherData } from "../types";

interface WeatherCardProps {
  location: string;
  weather: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ location, weather }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl mb-2">{location}</h2>
      <div className="text-4xl font-bold">{weather.temperature}°C</div>
      <div className="text-gray-600">Feels like: {weather.feelsLike}°C</div>
      <div className="grid grid-cols-2 gap-4 mt-4 text-gray-700 dark:text-gray-300">
        <div>
          <strong>Wind:</strong> {weather.windSpeed} m/s
        </div>
        <div>
          <strong>Humidity:</strong> {weather.humidity}%
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
