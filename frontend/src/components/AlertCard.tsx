import React from "react";
import { WeatherAlert } from "../types";
import {
  Trash2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Activity,
  RefreshCw,
} from "lucide-react";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

interface AlertCardProps {
  alert: WeatherAlert;
  onDelete: (id: string) => void;
  onEvaluate?: (id: string) => void;
  evaluating?: boolean;
  onExpand?: () => void;
  expanded?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onDelete,
  onEvaluate,
  evaluating,
  onExpand,
  expanded,
}) => {
  const locationText =
    alert.locationType === "city"
      ? alert.city
      : alert.lat !== undefined && alert.lon !== undefined
        ? `${alert.lat.toFixed(2)}, ${alert.lon.toFixed(2)}`
        : "Unknown";

  const lastEval = alert.evaluations?.[0];
  const isTriggered = lastEval?.triggered;

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paramLabel: Record<string, string> = {
    temperature: "Temperature",
    windSpeed: "Wind Speed",
    humidity: "Humidity",
    precipitationProbability: "Precipitation",
  };

  return (
    <div
      className={`card transition-all ${
        isTriggered ? "ring-2 ring-danger-400 dark:ring-danger-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {alert.name || "Unnamed Alert"}
            </h3>
            {isTriggered ? (
              <Badge variant="danger" dot>
                Triggered
              </Badge>
            ) : lastEval ? (
              <Badge variant="success" dot>
                Normal
              </Badge>
            ) : (
              <span title="This alert hasn't been evaluated yet. Click 'Evaluate Now' or wait for the next scheduled check (every 5 min).">
                <Badge variant="neutral">Pending</Badge>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {locationText}
            </span>
            <span className="flex items-center gap-1">
              <Activity size={14} />
              {paramLabel[alert.parameter] || alert.parameter} {alert.operator}{" "}
              {alert.threshold}
            </span>
          </div>

          {lastEval && (
            <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Last checked: {formatDate(lastEval.evaluatedAt)} - Value:{" "}
              <span
                className={`font-medium ${
                  isTriggered
                    ? "text-danger-600 dark:text-danger-400"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {lastEval.observedValue}
              </span>
            </div>
          )}

          {alert.createdAt && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Created {formatDate(alert.createdAt)}
            </p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onEvaluate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => alert.id && onEvaluate(alert.id)}
              disabled={evaluating}
              title="Evaluate now"
            >
              <RefreshCw
                size={14}
                className={evaluating ? "animate-spin" : ""}
              />
            </Button>
          )}
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => alert.id && onDelete(alert.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AlertCard);
