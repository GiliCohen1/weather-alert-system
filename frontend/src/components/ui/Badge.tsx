import React from "react";

type BadgeVariant = "success" | "danger" | "warning" | "info" | "neutral";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "badge-success",
  danger: "badge-danger",
  warning: "badge-warning",
  info: "badge-info",
  neutral:
    "badge bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
};

const dotColorClasses: Record<BadgeVariant, string> = {
  success: "bg-success-500",
  danger: "bg-danger-500",
  warning: "bg-secondary-500",
  info: "bg-primary-500",
  neutral: "bg-gray-400",
};

const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  size = "md",
  children,
  dot = false,
  className = "",
}) => {
  return (
    <span
      className={`${variantClasses[variant]} ${size === "sm" ? "badge-sm" : ""} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 dot-pulse ${dotColorClasses[variant]}`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
