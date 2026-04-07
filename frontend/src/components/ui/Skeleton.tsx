import React from "react";

interface SkeletonProps {
  className?: string;
}

/** Base skeleton block */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "h-4 w-full",
}) => <div className={`skeleton ${className}`} aria-hidden="true" />;

/** Card-shaped skeleton */
export const SkeletonCard: React.FC = () => (
  <div className="card space-y-4 animate-fadeIn">
    <Skeleton className="h-6 w-1/3 rounded" />
    <Skeleton className="h-4 w-2/3 rounded" />
    <Skeleton className="h-4 w-1/2 rounded" />
    <div className="flex gap-4 pt-2">
      <Skeleton className="h-10 w-24 rounded-lg" />
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
  </div>
);

/** Stat card skeleton */
export const SkeletonStat: React.FC = () => (
  <div className="card space-y-3">
    <Skeleton className="h-4 w-20 rounded" />
    <Skeleton className="h-8 w-16 rounded" />
    <Skeleton className="h-3 w-24 rounded" />
  </div>
);

/** Table row skeleton */
export const SkeletonRow: React.FC = () => (
  <div className="flex items-center gap-4 p-4">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/3 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

export default Skeleton;
