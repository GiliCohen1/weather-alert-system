import React from "react";
import { FileQuestion, Bell, CloudOff } from "lucide-react";
import Button from "./Button";

type EmptyVariant = "alerts" | "weather" | "default";

interface EmptyStateProps {
  variant?: EmptyVariant;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const icons: Record<EmptyVariant, React.ReactNode> = {
  alerts: <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600" />,
  weather: <CloudOff className="w-16 h-16 text-gray-300 dark:text-gray-600" />,
  default: (
    <FileQuestion className="w-16 h-16 text-gray-300 dark:text-gray-600" />
  ),
};

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = "default",
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fadeIn">
      {icons[variant]}
      <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
