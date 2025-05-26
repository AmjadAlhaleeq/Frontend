
import React from "react";

const LoadingSkeleton: React.FC<{ width?: string; height?: string; className?: string }> = ({
  width = "100%",
  height = "1.25rem",
  className = "",
}) => (
  <div
    className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
    style={{ width, height }}
    data-testid="loading-skeleton"
  />
);

export default LoadingSkeleton;
