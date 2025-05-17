
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorColor?: "default" | "green" | "amber" | "red"
  }
>(({ className, value, indicatorColor = "default", ...props }, ref) => {
  const getIndicatorColor = () => {
    switch (indicatorColor) {
      case "green":
        return "bg-green-500";
      case "amber":
        return "bg-amber-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/30",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all", getIndicatorColor())}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
