import React, { useState, useEffect, useCallback, useMemo } from "react";
import { weatherApi, notificationApi } from "../services/api";
import { WeatherAlert, Notification } from "../types";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import AlertStatusCard from "../components/AlertStatus";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import {
  AlertTriangle,
  CheckCircle,
  Radio,
  Wifi,
  WifiOff,
  Clock,
  Bell,
  Mail,
  MailOpen,
} from "lucide-react";
import toast from "react-hot-toast";

interface TimelineEvent {
  id: string;
  alertName: string;
  message: string;
  timestamp: Date;
  type: "triggered" | "resolved";
}

const StatusPage: React.FC = () => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await weatherApi.getAlerts(1, 100);
      setAlerts(res.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      if (!err?._rateLimitHandled) {
        toast.error("Failed to load alerts", { id: "status-alerts-error" });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Fetch notification history for logged-in users
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const data = await notificationApi.getNotifications();
        setNotifications(data.notifications);
      } catch (err: any) {
        if (!err?._rateLimitHandled) {
          toast.error("Failed to load notifications", {
            id: "status-notif-error",
          });
        }
      }
    };
    fetchNotifications();
  }, [user]);

  // Real-time WebSocket updates
  useEffect(() => {
    if (!socket) return;

    const handleTriggered = (data: {
      alertId: string;
      alertName: string;
      observedValue: number;
    }) => {
      setTimeline((prev) =>
        [
          {
            id: `${data.alertId}-${Date.now()}`,
            alertName: data.alertName || "Alert",
            message: `Triggered with value ${data.observedValue}`,
            timestamp: new Date(),
            type: "triggered" as const,
          },
          ...prev,
        ].slice(0, 20),
      );
      // Refetch to get updated state
      fetchAlerts();
    };

    socket.on("alert:triggered", handleTriggered);
    return () => {
      socket.off("alert:triggered", handleTriggered);
    };
  }, [socket, fetchAlerts]);

  // Periodic refresh as fallback (5 min)
  useEffect(() => {
    const interval = setInterval(fetchAlerts, 300000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const triggeredAlerts = useMemo(
    () => alerts.filter((a) => a.evaluations?.[0]?.triggered),
    [alerts],
  );
  const normalAlerts = useMemo(
    () =>
      alerts.filter(
        (a) => a.evaluations?.length && !a.evaluations[0].triggered,
      ),
    [alerts],
  );
  const pendingAlerts = useMemo(
    () => alerts.filter((a) => !a.evaluations?.length),
    [alerts],
  );

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 text-white" />
            </div>
            Live Status
          </h1>
          <p className="page-subtitle">Real-time alert monitoring dashboard</p>
        </div>
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <Badge variant={connected ? "success" : "danger"} dot>
            {connected ? (
              <span className="flex items-center gap-1">
                <Wifi size={12} /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WifiOff size={12} /> Offline
              </span>
            )}
          </Badge>
          {lastUpdated && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} />
              {formatTime(lastUpdated)}
            </span>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stat-card border-l-4 border-l-danger-500">
          <div className="stat-value text-danger-600 dark:text-danger-400">
            {triggeredAlerts.length}
          </div>
          <div className="stat-label">Triggered</div>
        </div>
        <div className="stat-card border-l-4 border-l-success-500">
          <div className="stat-value text-success-600 dark:text-success-400">
            {normalAlerts.length}
          </div>
          <div className="stat-label">Normal</div>
        </div>
        <div className="stat-card border-l-4 border-l-gray-400">
          <div className="stat-value text-gray-500">{pendingAlerts.length}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Triggered alerts - main column */}
          <div className="lg:col-span-2">
            {triggeredAlerts.length > 0 ? (
              <>
                <h2 className="text-lg font-bold text-danger-600 dark:text-danger-400 flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} />
                  Active Alerts ({triggeredAlerts.length})
                </h2>
                <div className="space-y-3">
                  {triggeredAlerts.map((alert) => (
                    <AlertStatusCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-success-50 dark:bg-success-900/20 rounded-2xl border border-success-200 dark:border-success-800 animate-fadeIn">
                <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-success-700 dark:text-success-400">
                  All Clear
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  No alerts are currently triggered
                </p>
              </div>
            )}

            {/* Normal alerts */}
            {normalAlerts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
                  <CheckCircle size={18} className="text-success-500" />
                  Normal ({normalAlerts.length})
                </h2>
                <div className="space-y-2">
                  {normalAlerts.map((alert) => (
                    <AlertStatusCard key={alert.id} alert={alert} compact />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline sidebar */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Event Timeline
            </h2>
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No events yet. Alert triggers will appear here in real-time.
              </p>
            ) : (
              <div className="space-y-3">
                {timeline.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg animate-slideInRight"
                  >
                    <div
                      className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                        event.type === "triggered"
                          ? "bg-danger-500"
                          : "bg-success-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.alertName}
                      </p>
                      <p className="text-xs text-gray-500">{event.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTime(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification History */}
      {user && notifications.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
            <Bell size={20} className="text-primary-500" />
            Notification History
          </h2>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition ${
                  n.read
                    ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-70"
                    : "border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/20"
                }`}
              >
                {n.read ? (
                  <MailOpen
                    size={16}
                    className="mt-0.5 text-gray-400 flex-shrink-0"
                  />
                ) : (
                  <Mail
                    size={16}
                    className="mt-0.5 text-primary-500 flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${n.read ? "text-gray-500 dark:text-gray-400" : "font-medium text-gray-900 dark:text-white"}`}
                  >
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {n.alert && (
                      <Badge variant="neutral" className="text-xs">
                        {n.alert.name || n.alert.parameter}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPage;
