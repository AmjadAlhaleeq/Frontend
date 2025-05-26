
import React from 'react';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Reservation } from '@/context/ReservationContext';
import ReservationCard from './ReservationCard';

interface ReservationsListProps {
  upcomingReservations: Reservation[];
  currentDate: Date | undefined;
  userRole: 'admin' | 'player' | null;
  currentUserId: string | null;
  pitchImages: Record<string, string>;
  calculateActualMaxPlayers: (maxPlayers: number) => number;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  onJoin: (id: number, playerName?: string) => void;
  onCancel: (id: number, userId: string) => void;
  onJoinWaitingList: (id: number, userId: string) => void;
  onLeaveWaitingList: (id: number, userId: string) => void;
  onDeleteReservation?: (id: number) => void;
  onViewDetails: (reservation: Reservation) => void;
  onAddSummary?: (reservation: Reservation) => void;
  onClearDateFilter: () => void;
}

const ReservationsList: React.FC<ReservationsListProps> = ({
  upcomingReservations,
  currentDate,
  userRole,
  currentUserId,
  pitchImages,
  calculateActualMaxPlayers,
  isUserJoined,
  onJoin,
  onCancel,
  onJoinWaitingList,
  onLeaveWaitingList,
  onDeleteReservation,
  onViewDetails,
  onAddSummary,
  onClearDateFilter
}) => {
  const upcomingGamesHeader = React.useMemo(() => {
    if (currentDate) {
      const formattedDate = format(currentDate, "MMM d, yyyy");
      if (upcomingReservations.length > 0) {
        return `Showing ${upcomingReservations.length} game${upcomingReservations.length === 1 ? '' : 's'} on ${formattedDate}`;
      }
      return `No upcoming games found for ${formattedDate}`;
    }
    return `Showing ${upcomingReservations.length} upcoming game${upcomingReservations.length === 1 ? '' : 's'}`;
  }, [currentDate, upcomingReservations.length]);

  return (
    <>
      <div className="flex justify-between items-center mb-1 px-1">
        <div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
          {upcomingGamesHeader}
        </div>
        {currentDate && (
           <Button variant="ghost" size="sm" onClick={onClearDateFilter} className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
             <XCircle className="h-3.5 w-3.5 mr-1" /> Clear Filter
           </Button>
        )}
      </div>

      {upcomingReservations.map((reservation) => (
        <div 
          key={`reservation-${reservation.id}`}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
          onClick={() => onViewDetails(reservation)}
        >
          <ReservationCard
            reservation={reservation}
            userId={currentUserId || ""}
            userRole={userRole || "player"}
            onJoin={onJoin}
            onCancel={onCancel}
            onJoinWaitingList={onJoinWaitingList}
            onLeaveWaitingList={onLeaveWaitingList}
            isUserJoined={isUserJoined}
            isFull={reservation.lineup ? reservation.lineup.length >= calculateActualMaxPlayers(reservation.maxPlayers) : false}
            onDeleteReservation={onDeleteReservation}
            onViewDetails={onViewDetails}
            onAddSummary={onAddSummary}
            isUserLoggedIn={!!currentUserId}
            pitchImage={pitchImages[reservation.pitchId]}
          />
        </div>
      ))}
    </>
  );
};

export default ReservationsList;
