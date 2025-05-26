
import React from 'react';
import BackendReservationForm from './BackendReservationForm';

interface ReservationsHeaderProps {
  userRole: 'admin' | 'player' | null;
  addDialogKey: number;
  onAddReservationSuccess: () => void;
  onLoadReservations: () => void;
}

const ReservationsHeader: React.FC<ReservationsHeaderProps> = ({
  userRole,
  addDialogKey,
  onAddReservationSuccess,
  onLoadReservations
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Reservations</h1>
        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
          Book and manage your football pitch reservations.
        </p>
      </div>
      {userRole === 'admin' && (
        <div id="add-reservation-dialog-trigger">
          <BackendReservationForm 
            key={addDialogKey} 
            onSuccess={() => {
              onAddReservationSuccess();
              onLoadReservations();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ReservationsHeader;
