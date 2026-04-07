import React from "react";
import { WeatherAlert } from "../types";
import { MapPin, Activity, AlertTriangle } from "lucide-react";
import Badge from "./ui/Badge";

interface AlertStatusCardProps {
  alert: WeatherAlert;
  compact?: boolean;
}

const AlertStatusCard: React.FC<AlertStatusCardProps> = ({
  alert,
  compact,
}) => {
  const location =
    alert.locationType === "city"
      ? alert.city
      : alert.lat !== undefined && alert.lon !== undefined
        ? `${alert.lat.toFixed(2)}, ${alert.lon.toFixed(2)}`
        : "Unknown";

  const lastEval = alert.evaluations?.[0];
  const isTriggered = lastEval?.triggered;

  // Severity based on how far above threshold
  const getSeverity = (): "critical" | "warning" | "info" => {
    if (!lastEval || !isTriggered) return "info";
    const diff = Math.abs(lastEval.observedValue - alert.threshold);
    const pct = diff / (alert.threshold || 1);
    if (pct > 0.5) return "critical";
    if (pct > 0.15) return "warning";
    return "info";
  };

  const severity = getSeverity();

  const severityStyles = {
    critical: "border-l-danger-600 bg-danger-200 dark:bg-danger-950/70",
    warning: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
    info: "border-l-primary-400 bg-primary-50 dark:bg-primary-900/10",
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {alert.name || "Unnamed"}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin size={12} /> {location}
          </span>
        </div>
        <Badge variant="success">OK</Badge>
      </div>
    );
  }

  return (
    <div
      className={`border-l-4 p-4 rounded-xl transition-all animate-fadeIn ${
        isTriggered
          ? severityStyles[severity]
          : "border-l-success-400 bg-success-50 dark:bg-success-900/10"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isTriggered && severity === "critical" && (
              <AlertTriangle
                size={18}
                className="text-danger-500 animate-pulse flex-shrink-0"
              />
            )}
              <h3
                className={`font-semibold ${
                  isTriggered && severity === "critical"
                    ? "text-danger-950 dark:text-danger-50"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
              {alert.name || "Unnamed Alert"}
            </h3>
            <Badge
              variant={
                severity === "critical"
                  ? "danger"
                  : severity === "warning"
                    ? "warning"
                    : "info"
              }
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {location}
            </span>
            <span className="flex items-center gap-1">
              <Activity size={14} /> {alert.parameter} {alert.operator}{" "}
              {alert.threshold}
            </span>
          </div>

          {lastEval && (
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-gray-500">Current:</span>
              <span
                className={`font-bold text-lg ${
                  isTriggered
                    ? "text-danger-600 dark:text-danger-400"
                    : "text-success-600 dark:text-success-400"
                }`}
              >
                {lastEval.observedValue}
              </span>
              <span className="text-gray-400">
                Threshold: {alert.threshold}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertStatusCard;
