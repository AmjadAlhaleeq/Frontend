
import React from "react";
import { Loader } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingSpinner component
 * Displays a loading animation with optional message
 * 
 * @param {object} props - Component properties
 * @param {string} props.size - Size of the spinner (sm, md, lg)
 * @param {string} props.message - Optional message to display
 * @param {boolean} props.fullScreen - Whether to display fullscreen
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  message = "Loading...",
  fullScreen = false 
}) => {
  const spinnerSizes = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  const containerClasses = fullScreen
    ? "fixed inset-0 flex flex-col items-center justify-center z-50 bg-background/90 backdrop-blur-sm"
    : "flex flex-col items-center justify-center py-8";
  
  return (
    <div className={containerClasses} data-testid="loading-spinner">
      <div className="flex flex-col items-center space-y-4">
        <Loader className={`${spinnerSizes[size]} text-teal-600 dark:text-teal-400 animate-spin`} />
        {message && (
          <p className="text-sm md:text-base font-medium text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
