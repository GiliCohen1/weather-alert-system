import React from "react";
import { WeatherAlert } from "../types";
import { Trash2, MapPin } from "lucide-react";

interface AlertCardProps {
  alert: WeatherAlert;
  onDelete: (id: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDelete }) => {
  const locationText =
    alert.locationType === "city"
      ? alert.city
      : alert.lat !== undefined && alert.lon !== undefined
      ? `${alert.lat},${alert.lon}`
      : "Unknown location";

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow hover:shadow-md transition">
      <h3 className="font-bold text-lg">{alert.name || "Unnamed Alert"}</h3>
      <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
        <MapPin className="w-5 h-5" />
        {locationText}
      </p>
      <p className="mt-1 text-gray-700 dark:text-gray-300">
        {alert.parameter} {alert.operator} {alert.threshold}
      </p>
      {alert.createdAt && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formatDate(alert.createdAt)}
        </p>
      )}
      <button
        onClick={() => alert.id && onDelete(alert.id)}
        className="mt-3 flex items-center gap-2 bg-danger hover:bg-red-600 text-white px-3 py-1 rounded transition"
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  );
};

export default AlertCard;
