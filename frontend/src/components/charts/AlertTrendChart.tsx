import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertEvaluation } from "../../types";

interface AlertTrendChartProps {
  evaluations: AlertEvaluation[];
  threshold: number;
  parameter: string;
}

const AlertTrendChart: React.FC<AlertTrendChartProps> = ({
  evaluations,
  threshold,
  parameter,
}) => {
  const data = useMemo(
    () =>
      [...evaluations].reverse().map((e) => ({
        time: new Date(e.evaluatedAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: e.observedValue,
        threshold,
        triggered: e.triggered,
      })),
    [evaluations, threshold],
  );

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No evaluation data yet
      </div>
    );
  }

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#1f2937",
              border: "none",
              borderRadius: "8px",
              color: "#f3f4f6",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value}`, parameter]}
          />
          <Area
            type="monotone"
            dataKey="threshold"
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            fill="none"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AlertTrendChart;
