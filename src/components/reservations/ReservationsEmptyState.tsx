
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ListFilter, XCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
  actionIcon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  onActionClick, 
  actionIcon 
}) => (
  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
    <div className="p-3 bg-teal-500/10 dark:bg-teal-400/10 rounded-full mb-4 mx-auto w-fit">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
    <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6 max-w-xs sm:max-w-md mx-auto">
      {description}
    </p>
    {actionText && onActionClick && (
      <Button 
        onClick={onActionClick} 
        className="bg-teal-600 hover:bg-teal-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 text-sm"
      >
        {actionText}
        {actionIcon}
      </Button>
    )}
  </div>
);

interface ReservationsEmptyStateProps {
  currentDate: Date | undefined;
  userRole: 'admin' | 'player' | null;
  onClearDateFilter: () => void;
}

const ReservationsEmptyState: React.FC<ReservationsEmptyStateProps> = ({
  currentDate,
  userRole,
  onClearDateFilter
}) => {
  return (
    <EmptyState
      icon={currentDate ? <ListFilter className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" /> : <CalendarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" />}
      title={
        currentDate 
        ? `No upcoming games on ${format(currentDate, "MMMM d, yyyy")}` 
        : "No upcoming games"
      }
      description={
        currentDate 
        ? "Try selecting a different date or clear the filter to see all upcoming games."
        : "No games scheduled yet. Check back later or, if you're an admin, add a new one!"
      }
      actionText={
        currentDate 
        ? "Clear Date Filter" 
        : (userRole === 'admin' ? "Add New Reservation" : undefined)
      }
      onActionClick={
        currentDate 
        ? onClearDateFilter 
        : userRole === 'admin' ? () => { 
            const addDialogButton = document.getElementById('add-reservation-dialog-trigger')?.querySelector('button');
            if (addDialogButton) addDialogButton.click();
          }
        : undefined
      }
      actionIcon={currentDate ? <XCircle className="ml-2 h-4 w-4" /> : (userRole === 'admin' ? <ArrowRight className="ml-2 h-4 w-4" /> : undefined)}
    />
  );
};

export default ReservationsEmptyState;
