
import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CustomProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

/**
 * CustomProgress component
 * Enhanced progress bar with custom indicator styling
 */
const CustomProgress: React.FC<CustomProgressProps> = ({
  value,
  max = 100,
  className,
  indicatorClassName
}) => {
  // Calculate percentage value
  const percentage = max > 0 ? Math.min(Math.max(0, value), max) / max * 100 : 0;
  
  return (
    <div className={cn("relative w-full", className)}>
      <Progress 
        value={percentage} 
        className="h-2"
      />
      {indicatorClassName && (
        <div 
          className={cn("absolute top-0 left-0 h-full transition-all", indicatorClassName)} 
          style={{ width: `${percentage}%` }}
        />
      )}
    </div>
  );
};

export default CustomProgress;
