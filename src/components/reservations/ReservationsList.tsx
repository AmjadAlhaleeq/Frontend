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
  // Separate into upcoming and completed
  const todayISO = new Date().toISOString().slice(0,10);
  const completedReservations = upcomingReservations.filter(
    r => r.status === "completed" || new Date(r.date) < new Date(todayISO)
  );
  const filteredUpcoming = upcomingReservations.filter(
    r => r.status === "upcoming" && new Date(r.date) >= new Date(todayISO)
  );

  // For users, only show "Upcoming Games" section, for admins show both sections
  const sections = userRole === 'admin' ? [
    {
      title: 'Upcoming Games',
      data: filteredUpcoming,
    },
    {
      title: 'Completed Games',
      data: completedReservations,
    }
  ] : [
    {
      title: 'My Upcoming Games',
      data: filteredUpcoming,
    }
    // Do not show completed games section for users
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-1 px-1">
        <div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
          {currentDate 
            ? `Showing games on ${format(currentDate, "MMM d, yyyy")}` 
            : `Showing all games`
          }
        </div>
        {currentDate && (
          <Button variant="ghost" size="sm" onClick={onClearDateFilter} className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
            <XCircle className="h-3.5 w-3.5 mr-1" /> Clear Filter
          </Button>
        )}
      </div>

      {sections.map(s => (
        <div key={s.title}>
          <div className="text-sm text-teal-700 mt-4 mb-2 font-semibold">{s.title}</div>
          {s.data.length === 0 ? (
            <div className="text-xs text-muted-foreground px-2 pb-4">No games found.</div>
          ) : (
            s.data.map((reservation) => (
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
            ))
          )}
        </div>
      ))}
    </>
  );
};

export default ReservationsList;
