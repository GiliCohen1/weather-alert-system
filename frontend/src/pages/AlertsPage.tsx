import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Plus,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { weatherApi } from "../services/api";
import { WeatherAlert, AlertEvaluation } from "../types";
import AlertCard from "../components/AlertCard";
import WeatherAlertForm from "../components/WeatherAlert";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { ConfirmModal } from "../components/ui/Modal";
import AlertTrendChart from "../components/charts/AlertTrendChart";
import toast from "react-hot-toast";

type SortField = "createdAt" | "name" | "parameter";
type FilterStatus = "all" | "triggered" | "active";

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<
    Record<string, AlertEvaluation[]>
  >({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await weatherApi.getAlerts(page, 20);
      setAlerts(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      if (!err?._rateLimitHandled) {
        toast.error("Failed to load alerts", { id: "load-alerts-error" });
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await weatherApi.deleteAlert(deleteTarget);
      toast.success("Alert deleted");
      setDeleteTarget(null);
      loadAlerts();
    } catch {
      toast.error("Failed to delete alert");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEvaluate = async (id: string) => {
    setEvaluatingId(id);
    try {
      await weatherApi.evaluateAlert(id);
      toast.success("Alert evaluated");
      loadAlerts();
    } catch (err: any) {
      if (!err?._rateLimitHandled) {
        toast.error("Failed to evaluate alert");
      }
    } finally {
      setEvaluatingId(null);
    }
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!historyData[id]) {
      try {
        const res = await weatherApi.getAlertHistory(id, 1, 20);
        setHistoryData((prev) => ({ ...prev, [id]: res.data }));
      } catch {
        // silently fail
      }
    }
  };

  // Filter & sort
  const filteredAlerts = alerts
    .filter((a) => {
      if (filterStatus === "triggered") return a.evaluations?.[0]?.triggered;
      if (filterStatus === "active") return !a.evaluations?.[0]?.triggered;
      return true;
    })
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortField === "createdAt") {
        return dir * (a.createdAt || "").localeCompare(b.createdAt || "");
      }
      if (sortField === "name") {
        return dir * (a.name || "").localeCompare(b.name || "");
      }
      return dir * a.parameter.localeCompare(b.parameter);
    });

  return (
    <div className="container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Weather Alerts
          </h1>
          <p className="page-subtitle">
            Create and manage weather condition monitors
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="mt-4 sm:mt-0"
        >
          <Plus size={18} />
          {showForm ? "Hide Form" : "New Alert"}
        </Button>
      </div>

      {/* Create Alert Form (collapsible) */}
      {showForm && (
        <Card className="mb-8 animate-slideUp">
          <Card.Header>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Create New Alert
            </h2>
          </Card.Header>
          <Card.Body>
            <WeatherAlertForm
              onCreated={() => {
                loadAlerts();
                setShowForm(false);
                toast.success("Alert created!");
              }}
            />
          </Card.Body>
        </Card>
      )}

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          {(["all", "triggered", "active"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterStatus === f
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (sortField === "createdAt") setSortAsc(!sortAsc);
            else setSortField("createdAt");
          }}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <ArrowUpDown size={14} />
          Date {sortField === "createdAt" && (sortAsc ? "↑" : "↓")}
        </button>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          variant="alerts"
          title="No alerts found"
          description={
            filterStatus !== "all"
              ? "Try changing the filter to see more alerts"
              : "Create your first weather alert to start monitoring conditions"
          }
          actionLabel={filterStatus === "all" ? "Create Alert" : undefined}
          onAction={
            filterStatus === "all" ? () => setShowForm(true) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="animate-fadeIn">
              <AlertCard
                alert={alert}
                onDelete={(id) => setDeleteTarget(id)}
                onEvaluate={handleEvaluate}
                evaluating={evaluatingId === alert.id}
                onExpand={() => alert.id && toggleExpand(alert.id)}
                expanded={expandedId === alert.id}
              />
              {/* Expanded chart */}
              {expandedId === alert.id && (
                <div className="ml-4 mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 animate-slideUp">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Evaluation History
                  </h4>
                  <AlertTrendChart
                    evaluations={historyData[alert.id!] || []}
                    threshold={alert.threshold}
                    parameter={alert.parameter}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronUp className="rotate-[-90deg]" size={16} />
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronDown className="rotate-[-90deg]" size={16} />
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Alert"
        message="Are you sure you want to delete this alert? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default AlertsPage;
