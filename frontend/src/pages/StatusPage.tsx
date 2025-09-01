// pages/Status.tsx
import React, { useState, useEffect, useCallback } from "react";
import { weatherApi } from "../services/api";
import { WeatherAlert } from "../types";
import AlertCardStatus from "../components/AlertStatus";
import { AlertTriangle, CheckCircle } from "lucide-react";

const Status: React.FC = () => {
  const [triggeredAlerts, setTriggeredAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const alerts = await weatherApi.getAlerts();
      const triggered = alerts.filter(
        (alert) => alert.evaluations?.[0]?.triggered
      );
      setTriggeredAlerts(triggered);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, 60000); // update every minute
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (loading)
    return (
      <div className="flex justify-center py-8 text-primary">Loading...</div>
    );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {triggeredAlerts.length > 0 ? (
          <>
            {/* Active Alerts */}
            <h2 className="text-xl font-bold mb-4 text-danger flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Active Alerts
            </h2>
            <div className="space-y-4">
              {triggeredAlerts.map((alert) => (
                <AlertCardStatus key={alert.id} alert={alert} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* All Clear */}
            <div className="text-center py-12 bg-success/20 dark:bg-green-900 rounded-2xl shadow animate-fadeIn">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-success">✓ All Clear</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                No alerts currently triggered
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Status;
