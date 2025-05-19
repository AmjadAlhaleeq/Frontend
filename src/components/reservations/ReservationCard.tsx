import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trash2, Edit, Users, UserPlus, UserMinus } from "lucide-react";
import { Reservation, useReservation } from "@/context/ReservationContext";
import { useToast } from "@/components/ui/use-toast";
import EditReservationDialog from "./EditReservationDialog";
import CancelConfirmationDialog from "./CancelConfirmationDialog";

interface ReservationCardProps {
  reservation: Reservation;
  type: "upcoming" | "past";
  onJoinGame?: (reservationId: number) => void;
  onCancelReservation?: (reservationId: number) => void;
  onJoinWaitingList?: (reservationId: number) => void;
  isUserJoined?: boolean;
  isUserOnWaitingList?: boolean;
  onLeaveWaitingList?: (reservationId: number) => void;
  hasUserJoinedOnDate?: (date: string) => boolean;
  currentUserId?: string;
  isAdmin?: boolean; // New prop to determine if the current user is an admin
}

/**
 * ReservationCard component displays individual reservation details and actions.
 * It adapts its displayed actions based on the reservation type (upcoming/past)
 * and user roles/status (admin, joined, on waitlist).
 */
const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  type,
  onJoinGame,
  onCancelReservation,
  onJoinWaitingList,
  isUserJoined,
  isUserOnWaitingList,
  onLeaveWaitingList,
  hasUserJoinedOnDate,
  currentUserId = "user1", // Default or placeholder, should come from auth context ideally
  isAdmin = false, // Default isAdmin to false
}) => {
  const { toast } = useToast();
  const { deleteReservation } = useReservation(); // Assuming this is admin-only or has internal checks
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Determine if the user has already joined another game on the same date
  const userAlreadyJoinedOnDate =
    hasUserJoinedOnDate && !isUserJoined
      ? hasUserJoinedOnDate(reservation.date)
      : false;
  const slotsLeft = reservation.maxPlayers - reservation.playersJoined;
  const isFull = reservation.status === 'full';

  // Handles the confirmation of cancelling a user's participation in a game
  const handleCancelConfirm = () => {
    onCancelReservation?.(reservation.id);
    setShowCancelDialog(false);
    // TODO: API Call: Notify backend of user leaving the game
    toast({
      title: "Reservation Cancelled",
      description: "You've successfully left the game",
      // ...
    });
  };
  
  const reservationName = `${reservation.pitchName} Game #${reservation.id}`;

  // Handles the deletion of a reservation (typically admin action)
  const handleDeleteReservation = () => {
     // Confirmation dialog for such a destructive action is good practice
     if (window.confirm(`Are you sure you want to delete the reservation "${reservationName}"? This action cannot be undone.`)) {
        // TODO: API Call: Send delete request to backend for this reservation.id
        deleteReservation(reservation.id);
        toast({
          title: "Reservation Deleted",
          description: "The reservation has been successfully deleted",
          // ...
        });
     }
  };

  return (
    <div className="hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex flex-col sm:flex-row">
        {/* Reservation Image Section */}
        <div className="w-full sm:w-48 h-48 sm:h-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-teal-600/20 dark:from-teal-700/20 dark:to-teal-800/30 opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
          <img
            src={reservation.imageUrl || `https://source.unsplash.com/random/400x400/?soccer,pitch&sig=${reservation.id}`}
            alt={reservation.pitchName}
            className="w-full h-full object-cover"
          />
          <Badge
            className={cn(
              "absolute top-3 right-3 text-xs px-2 py-1 font-semibold",
              // ... keep existing code (badge styling)
              reservation.status === "open"
                ? "bg-green-500 text-white"
                : reservation.status === "full"
                ? "bg-orange-500 text-white"
                : reservation.status === "completed"
                ? "bg-blue-500 text-white"
                : "bg-gray-500 text-white"
            )}
          >
            {reservation.status.charAt(0).toUpperCase() +
              reservation.status.slice(1)}
          </Badge>
        </div>

        {/* Reservation Details and Actions Section */}
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-400 mb-0.5">
                {reservationName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{reservation.date}, {reservation.time}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{reservation.location}</p>
            </div>
            {/* Admin controls for upcoming games */}
            {type === "upcoming" && isAdmin && (
              <div className="flex space-x-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEditDialog(true)}
                  className="h-8 w-8 text-teal-600 border-teal-600/30 hover:bg-teal-500/10 dark:text-teal-400 dark:border-teal-400/30 dark:hover:bg-teal-400/10"
                  title="Edit Reservation"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDeleteReservation}
                  className="h-8 w-8 text-red-500 border-red-500/30 hover:bg-red-500/10 dark:text-red-400 dark:border-red-400/30 dark:hover:bg-red-400/10"
                  title="Delete Reservation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
             {/* Admin control to delete past game records */}
            {type === "past" && isAdmin && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleDeleteReservation}
                className="h-8 w-8 text-red-500 border-red-500/30 hover:bg-red-500/10 dark:text-red-400 dark:border-red-400/30 dark:hover:bg-red-400/10"
                title="Delete Past Reservation Record"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Player Count and Progress Bar */}
          <div className="mt-3 mb-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2" />
              <div className="flex-1">
                <div className="flex justify-between items-center text-sm">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {reservation.playersJoined}/{reservation.maxPlayers}{" "}
                    players
                  </p>
                  {/* ... keep existing code (slots left / game full text) */}
                  {slotsLeft > 0 && reservation.status === 'open' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {slotsLeft} spot{slotsLeft > 1 ? 's' : ''} left
                    </span>
                  )}
                  {isFull && (
                     <span className="text-xs text-orange-500 dark:text-orange-400">
                      Game Full
                    </span>
                  )}
                </div>
                <Progress
                  value={
                    (reservation.playersJoined / reservation.maxPlayers) * 100
                  }
                  // ... keep existing code (progress bar styling)
                  className="h-1.5 mt-1 bg-teal-500/20 dark:bg-teal-400/20 [&>div]:bg-teal-500 dark:[&>div]:bg-teal-400"
                />
              </div>
            </div>
          </div>

          {/* User Actions (Join/Leave Game/Waitlist) */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-3 border-t border-gray-200/70 dark:border-gray-700/70">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
              {/* ... keep existing code (user status messages: You're in this game / You're on the waitlist) */}
              {isUserJoined && type === "upcoming" && (
                <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  You're in this game
                </div>
              )}
              {isUserOnWaitingList && type === "upcoming" && !isUserJoined && (
                 <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    You're on the waitlist
                </div>
              )}
            </div>
            <div className="flex space-x-2 w-full sm:w-auto">
              {type === "upcoming" && (
                <>
                  {isUserJoined ? (
                    <Button
                      onClick={() => setShowCancelDialog(true)} // Opens cancel confirmation
                      variant="outline"
                      className="w-full sm:w-auto text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:border-red-400/50 dark:hover:bg-red-400/10"
                    >
                      <UserMinus className="h-4 w-4 mr-1.5" />
                      Leave Game
                    </Button>
                  ) : isFull ? (
                    // Game is full, options to join/leave waitlist
                    isUserOnWaitingList ? (
                        <Button
                            onClick={() => {
                              // TODO: API Call: Notify backend user is leaving waitlist
                              onLeaveWaitingList?.(reservation.id);
                            }}
                            variant="outline"
                            className="w-full sm:w-auto text-orange-600 border-orange-500/50 hover:bg-orange-500/10 dark:text-orange-400 dark:border-orange-400/50 dark:hover:bg-orange-400/10"
                        >
                            <UserMinus className="h-4 w-4 mr-1.5" />
                            Leave Waitlist
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                              // TODO: API Call: Notify backend user is joining waitlist
                              onJoinWaitingList?.(reservation.id);
                            }}
                            variant="outline"
                            className="w-full sm:w-auto text-blue-600 border-blue-500/50 hover:bg-blue-500/10 dark:text-blue-400 dark:border-blue-400/50 dark:hover:bg-blue-400/10"
                            disabled={userAlreadyJoinedOnDate}
                        >
                           <UserPlus className="h-4 w-4 mr-1.5" />
                           {userAlreadyJoinedOnDate ? "Booked Today" : "Join Waitlist"}
                        </Button>
                    )
                  ) : (
                    // Game is open, option to join
                    <Button
                      onClick={() => {
                        // TODO: API Call: Notify backend user is joining game
                        onJoinGame?.(reservation.id);
                      }}
                      className={cn(
                        "w-full sm:w-auto bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white",
                        userAlreadyJoinedOnDate && "bg-gray-400 dark:bg-gray-600 cursor-not-allowed hover:bg-gray-400 dark:hover:bg-gray-600"
                      )}
                      disabled={userAlreadyJoinedOnDate}
                    >
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      {userAlreadyJoinedOnDate ? "Booked Today" : "Join Game"}
                    </Button>
                  )}
                </>
              )}
              {type === "past" && !isAdmin && ( // Regular users see View Details for past games
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-teal-600 border-teal-500/50 hover:bg-teal-500/10 dark:text-teal-400 dark:border-teal-400/50 dark:hover:bg-teal-400/10"
                  onClick={() => { 
                     // This toast is fine, actual navigation/dialog opening is handled by parent page (Reservations.tsx)
                     toast({ title: "Viewing Past Game", description: `Details for ${reservationName}`});
                     // The parent (Reservations.tsx) should handle opening its own details dialog
                  }}
                >
                  View Details 
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Reservation Dialog - only shown if triggered, now also depends on isAdmin for button visibility */}
      {showEditDialog && (
        <EditReservationDialog
          reservation={reservation}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          isAdmin={isAdmin} // Pass the isAdmin status to the dialog
        />
      )}

      {/* Cancel Confirmation Dialog for leaving a game */}
      <CancelConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelConfirm}
        pitchName={reservation.pitchName}
        time={reservation.time}
        date={reservation.date}
      />
    </div>
  );
};

export default ReservationCard;
