import React, { useState, useEffect, useCallback } from "react";
import WeatherAlertForm from "../components/WeatherAlert";
import AlertCard from "../components/AlertCard";
import { weatherApi } from "../services/api";
import { WeatherAlert } from "../types";

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await weatherApi.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await weatherApi.deleteAlert(id);
      await loadAlerts();
    } catch (err) {
      console.error(`Failed to delete alert ${id}:`, err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 grid md:grid-cols-2 gap-8">
      {/* Create Alert */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition animate-fadeIn">
        <h2 className="text-xl font-bold mb-4 text-secondary">
          ➕ Create New Alert
        </h2>
        <WeatherAlertForm children={loadAlerts} />
      </div>

      {/* Existing Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition animate-fadeIn">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          📋 Existing Alerts
        </h2>
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading...
          </p>
        ) : alerts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No alerts yet
          </p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
