
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground bg-white/90 border-gray-300",
      },
      size: {
        normal: "",
        large: "text-base py-2 px-4",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "normal"
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    size?: "normal" | "large";
  }

/**
 * Custom Badge: improved hover, larger badges possible.
 */
function Badge({ className, variant, size = "normal", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        "transition-transform duration-150 hover:scale-110 hover:shadow-lg cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
