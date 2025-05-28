
import React from "react";
import { CheckCircle } from "lucide-react";
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
  onKickPlayer: (playerId: string, suspensionDays: number, reason: string) => void;
  onAddSummary: (reservation: Reservation) => void;
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
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Upcoming Games */}
      <div>
        <div className="flex items-center mb-4">
          <CheckCircle className="h-5 w-5 mr-2 text-teal-600" />
          <h2 className="text-xl font-semibold text-teal-600">
            Upcoming Games
          </h2>
        </div>

        {upcomingReservations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No upcoming games found.
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingReservations.map((reservation) => (
              <ReservationCardEnhanced
                key={reservation.id}
                reservation={reservation}
                userRole={userRole}
                currentUserId={currentUserId || ""}
                isUserJoined={isUserJoined(reservation)}
                isUserInWaitlist={isUserInWaitlist(reservation)}
                isFull={isFull(reservation)}
                onJoinGame={() => onJoinGame(reservation)}
                onLeaveGame={() => onLeaveGame(reservation)}
                onJoinWaitlist={() => onJoinWaitlist(reservation)}
                onLeaveWaitlist={() => onLeaveWaitlist(reservation)}
                onViewDetails={() => onViewDetails(reservation)}
                onDeleteReservation={() => onDeleteReservation(reservation)}
                onKickPlayer={onKickPlayer}
                onAddSummary={() => onAddSummary(reservation)}
                pitchImage={pitchImages[reservation.pitchId]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Games (Admin Only) */}
      {userRole === "admin" && (
        <div>
          <div className="flex items-center mb-4">
            <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold text-blue-600">
              Completed Games
            </h2>
          </div>

          {completedReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No completed games found.
            </div>
          ) : (
            <div className="grid gap-4">
              {completedReservations.map((reservation) => {
                const hasGameSummary =
                  reservation.summary &&
                  typeof reservation.summary === "object" &&
                  (reservation.summary as any)?.completed;

                if (hasGameSummary) return null;

                return (
                  <ReservationCardEnhanced
                    key={reservation.id}
                    reservation={reservation}
                    userRole={userRole}
                    currentUserId={currentUserId || ""}
                    isUserJoined={isUserJoined(reservation)}
                    isUserInWaitlist={isUserInWaitlist(reservation)}
                    isFull={isFull(reservation)}
                    onJoinGame={() => {}}
                    onLeaveGame={() => {}}
                    onJoinWaitlist={() => {}}
                    onLeaveWaitlist={() => {}}
                    onViewDetails={() => onViewDetails(reservation)}
                    onKickPlayer={onKickPlayer}
                    onAddSummary={() => onAddSummary(reservation)}
                    pitchImage={pitchImages[reservation.pitchId]}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationsEnhancedList;
