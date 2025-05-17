
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from './card';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  accentColor?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
}

/**
 * Enhanced Card component with modern styling
 */
const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  accentColor = "#0F766E",
  header,
  footer,
  hover = false,
}) => {
  return (
    <Card 
      className={cn(
        "border-0 overflow-hidden",
        hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      style={{
        boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)`
      }}
    >
      {header && (
        <CardHeader 
          className={cn(
            "relative pb-2",
            headerClassName
          )}
        >
          {/* Accent line at the top of the card */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: accentColor }}
          />
          {header}
        </CardHeader>
      )}
      
      <CardContent className={cn("px-5 py-4", contentClassName)}>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className={cn("px-5 py-4 flex justify-between border-t border-gray-100 dark:border-gray-800", footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default ModernCard;
