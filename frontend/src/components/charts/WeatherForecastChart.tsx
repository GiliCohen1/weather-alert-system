import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { ForecastInterval } from "../../types";

type ForecastParam =
  | "temperature"
  | "windSpeed"
  | "humidity"
  | "precipitationProbability";

type ActiveParam = ForecastParam | "all";

interface WeatherForecastChartProps {
  intervals: ForecastInterval[];
  timestep: "1h" | "1d";
}

const paramConfig: Record<
  ForecastParam,
  { label: string; color: string; unit: string }
> = {
  temperature: { label: "Temperature", color: "#f97316", unit: "°C" },
  windSpeed: { label: "Wind Speed", color: "#3b82f6", unit: " m/s" },
  humidity: { label: "Humidity", color: "#06b6d4", unit: "%" },
  precipitationProbability: {
    label: "Precipitation",
    color: "#8b5cf6",
    unit: "%",
  },
};

const PARAMS: ForecastParam[] = [
  "temperature",
  "windSpeed",
  "humidity",
  "precipitationProbability",
];

const WeatherForecastChart: React.FC<WeatherForecastChartProps> = ({
  intervals,
  timestep,
}) => {
  const [activeParam, setActiveParam] = useState<ActiveParam>("temperature");

  const isAll = activeParam === "all";

  const data = intervals.map((iv) => {
    const time =
      timestep === "1h"
        ? new Date(iv.time).toLocaleString("en-US", {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date(iv.time).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
    if (isAll) {
      return {
        time,
        temperature: iv.temperature,
        windSpeed: iv.windSpeed,
        humidity: iv.humidity,
        precipitationProbability: iv.precipitationProbability,
      };
    }
    return {
      time,
      value: iv[activeParam as ForecastParam],
    };
  });

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
        No forecast data available
      </div>
    );
  }

  const cfg = !isAll ? paramConfig[activeParam as ForecastParam] : null;
  const values = !isAll ? data.map((d) => (d as any).value as number) : [];
  const avg =
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  return (
    <div>
      {/* Parameter toggle */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveParam("all")}
          className={activeParam === "all" ? "tab-item-active" : "tab-item"}
        >
          All
        </button>
        {PARAMS.map((p) => (
          <button
            key={p}
            onClick={() => setActiveParam(p)}
            className={activeParam === p ? "tab-item-active" : "tab-item"}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: paramConfig[p].color }}
            />
            {paramConfig[p].label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              opacity={0.5}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              interval={timestep === "1h" ? Math.floor(data.length / 8) : 0}
              angle={timestep === "1h" ? -30 : 0}
              textAnchor={timestep === "1h" ? "end" : "middle"}
              height={timestep === "1h" ? 50 : 30}
            />
            {isAll ? (
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                width={45}
              />
            ) : (
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                width={45}
                tickFormatter={(v) => `${v}${cfg!.unit}`}
              />
            )}
            <Tooltip
              contentStyle={{
                background: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#f3f4f6",
                fontSize: 12,
                boxShadow: "0 10px 25px rgb(0 0 0 / 0.3)",
              }}
              formatter={(value: number, name: string) => {
                if (isAll) {
                  const param = name as ForecastParam;
                  const pc = paramConfig[param];
                  return [`${value.toFixed(1)}${pc.unit}`, pc.label];
                }
                return [`${value.toFixed(1)}${cfg!.unit}`, cfg!.label];
              }}
              labelStyle={{ color: "#9ca3af", marginBottom: 4 }}
            />
            {isAll ? (
              <>
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value: string) => {
                    const pc = paramConfig[value as ForecastParam];
                    return pc ? pc.label : value;
                  }}
                />
                {PARAMS.map((p) => (
                  <Line
                    key={p}
                    type="monotone"
                    dataKey={p}
                    stroke={paramConfig[p].color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: paramConfig[p].color,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                ))}
              </>
            ) : (
              <>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop
                      offset="0%"
                      stopColor={cfg!.color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={cfg!.color}
                      stopOpacity={1}
                    />
                  </linearGradient>
                </defs>
                <ReferenceLine
                  y={avg}
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: `Avg: ${avg.toFixed(1)}`,
                    position: "insideTopRight",
                    fill: "#9ca3af",
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="url(#forecastGrad)"
                  strokeWidth={2.5}
                  dot={timestep === "1d"}
                  activeDot={{
                    r: 5,
                    fill: cfg!.color,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherForecastChart;
