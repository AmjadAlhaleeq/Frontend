import React from "react";
import { Button } from "@/components/ui/button";
import { XCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Reservation } from "@/types/reservation";
import ReservationCardEnhanced from "./ReservationCardEnhanced";

interface ReservationsEnhancedListProps {
  upcomingReservations: Reservation[];
  completedReservations: Reservation[];
  userRole: "admin" | "player" | null;
  currentUserId: string;
  pitchImages: Record<string, string>;
  isUserJoined: (reservation: Reservation) => boolean;
  isUserInWaitlist: (reservation: Reservation) => boolean;
  isFull: (reservation: Reservation) => boolean;
  onJoinGame: (reservation: Reservation) => void;
  onLeaveGame: (reservation: Reservation) => void;
  onJoinWaitlist: (reservation: Reservation) => void;
  onLeaveWaitlist: (reservation: Reservation) => void;
  onViewDetails: (reservation: Reservation) => void;
  onDeleteReservation: (reservation: Reservation) => void;
  onKickPlayer: (playerId: string, playerName: string) => void;
  onAddSummary: (reservation: Reservation) => void;
  loadingStates?: Record<string, boolean>;
}

const ReservationsEnhancedList: React.FC<ReservationsEnhancedListProps> = ({
  upcomingReservations,
  completedReservations,
  userRole,
  currentUserId,
  pitchImages,
  isUserJoined,
  isUserInWaitlist,
  isFull,
  onJoinGame,
  onLeaveGame,
  onJoinWaitlist,
  onLeaveWaitlist,
  onViewDetails,
  onDeleteReservation,
  onKickPlayer,
  onAddSummary,
  loadingStates = {},
}) => {
  const renderReservationSection = (
    title: string,
    icon: React.ReactNode,
    reservations: Reservation[]
  ) => {
    if (reservations.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-teal-600 dark:text-teal-400 flex items-center">
            {icon}
            {title}
          </h2>
          <span className="text-sm text-gray-500">
            {reservations.length} game{reservations.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <ReservationCardEnhanced
              key={reservation.id}
              reservation={reservation}
              userRole={userRole}
              currentUserId={currentUserId}
              pitchImage={pitchImages[reservation.pitchId]}
              isUserJoined={isUserJoined(reservation)}
              isUserInWaitlist={isUserInWaitlist(reservation)}
              isFull={isFull(reservation)}
              onJoinGame={() => onJoinGame(reservation)}
              onLeaveGame={() => onLeaveGame(reservation)}
              onJoinWaitlist={() => onJoinWaitlist(reservation)}
              onLeaveWaitlist={() => onLeaveWaitlist(reservation)}
              onViewDetails={() => onViewDetails(reservation)}
              onDeleteReservation={() => onDeleteReservation(reservation)}
              onKickPlayer={(playerId: string, suspensionDays: number, reason: string) => {
                // Find the player name from the reservation
                const player = reservation.lineup?.find(p => p.userId === playerId);
                const playerName = player?.name || player?.playerName || `Player ${playerId.substring(0, 4)}`;
                onKickPlayer(playerId, playerName);
              }}
              onAddSummary={() => onAddSummary(reservation)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Upcoming Games */}
      {renderReservationSection(
        "Upcoming Games",
        <CheckCircle className="h-5 w-5 mr-2" />,
        upcomingReservations
      )}

      {/* Completed Games (Admin Only) */}
      {userRole === "admin" &&
        renderReservationSection(
          "Completed Games",
          <Clock className="h-5 w-5 mr-2" />,
          completedReservations
        )}

      {/* Empty State */}
      {upcomingReservations.length === 0 && completedReservations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No games found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {userRole === "admin"
              ? "Create your first game to get started"
              : "Check back later for new games"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReservationsEnhancedList;
