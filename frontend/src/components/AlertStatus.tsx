import React from "react";
import { WeatherAlert } from "../types";

interface AlertStatusProps {
  alert: WeatherAlert;
}

const AlertStatus: React.FC<AlertStatusProps> = ({ alert }) => {
  const location =
    alert.locationType === "city"
      ? alert.city
      : alert.lat !== undefined && alert.lon !== undefined
      ? `${alert.lat},${alert.lon}`
      : "Unknown location";

  return (
    <div className="bg-red-50 dark:bg-red-900 border-l-4 border-danger p-4 rounded-xl animate-pulse">
      <h3 className="font-bold text-lg">{alert.name || "Unnamed Alert"}</h3>
      <p className="text-gray-700 dark:text-gray-300">Location: {location}</p>
      <p className="text-gray-700 dark:text-gray-300">
        Condition: {alert.parameter} {alert.operator} {alert.threshold}
      </p>
    </div>
  );
};

export default AlertStatus;
