
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

/**
 * Responsive grid component that adapts column count to screen width
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 6,
}) => {
  // Defaults if specific breakpoints aren't provided
  const smCols = cols.sm || cols.default;
  const mdCols = cols.md || smCols;
  const lgCols = cols.lg || mdCols;
  const xlCols = cols.xl || lgCols;

  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${cols.default}`,
        `sm:grid-cols-${smCols}`,
        `md:grid-cols-${mdCols}`,
        `lg:grid-cols-${lgCols}`,
        `xl:grid-cols-${xlCols}`,
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
