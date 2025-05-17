
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trash2, Edit, Users } from "lucide-react";
import { Reservation, useReservation } from "@/context/ReservationContext";
import { useToast } from "@/components/ui/use-toast";
import EditReservationDialog from "./EditReservationDialog";
import CancelConfirmationDialog from "./CancelConfirmationDialog";

interface ReservationCardProps {
  reservation: Reservation;
  type: "upcoming" | "past";
  onJoinGame?: () => void;
  onCancelReservation?: (id: number) => void;
  onJoinWaitingList?: (id: number) => void;
  isUserJoined?: boolean;
  hasUserJoinedOnDate?: (date: string) => boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  type,
  onJoinGame,
  onCancelReservation,
  onJoinWaitingList,
  isUserJoined,
  hasUserJoinedOnDate,
}) => {
  const { toast } = useToast();
  const { deleteReservation } = useReservation();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const userAlreadyJoinedOnDate =
    hasUserJoinedOnDate && !isUserJoined
      ? hasUserJoinedOnDate(reservation.date)
      : false;
  const slotsLeft = reservation.maxPlayers - reservation.playersJoined;

  const handleCancelConfirm = () => {
    onCancelReservation?.(reservation.id);
    setShowCancelDialog(false);
    toast({
      title: "Reservation Cancelled",
      description: "You've successfully left the game",
      duration: 3000,
      className: "bg-red-100 text-red-700",
    });
  };
  
  // Generate a unique pitch-specific name
  const reservationName = `${reservation.pitchName} Game #${reservation.id}`;

  return (
    <div className="hover:shadow-md transition-shadow duration-200 overflow-hidden bg-white border border-[#0F766E]/20 rounded-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 h-48 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E]/20 to-[#0F766E]/40" />
          <img
            src={`https://source.unsplash.com/random/400x400/?football,soccer,pitch&${reservation.id}`}
            alt={reservation.pitchName}
            className="w-full h-full object-cover"
          />
          <Badge
            className={cn(
              "absolute top-4 right-4",
              reservation.status === "open"
                ? "bg-[#0F766E]"
                : reservation.status === "full"
                ? "bg-orange-500"
                : "bg-gray-500"
            )}
          >
            {reservation.status.charAt(0).toUpperCase() +
              reservation.status.slice(1)}
          </Badge>
        </div>

        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-[#0F766E] mb-1">
                {reservationName}
              </h3>
              <p className="text-sm text-gray-600">{reservation.date}, {reservation.time}</p>
              <p className="text-sm text-gray-600">{reservation.location}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowEditDialog(true)}
                className="text-[#0F766E] border-[#0F766E]/20 hover:bg-[#0F766E]/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (type === "past") {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this past reservation?"
                      )
                    ) {
                      deleteReservation(reservation.id);
                    }
                  } else {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this reservation?"
                      )
                    ) {
                      deleteReservation(reservation.id);
                    }
                  }
                }}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-[#0F766E] mr-2" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">
                    {reservation.playersJoined}/{reservation.maxPlayers}{" "}
                    players
                  </p>
                  <span className="text-xs text-gray-500">
                    {slotsLeft} spots left
                  </span>
                </div>
                <Progress
                  value={
                    (reservation.playersJoined / reservation.maxPlayers) * 100
                  }
                  className="h-1 mt-2 bg-[#0F766E]/20"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#0F766E]/10">
            <div className="text-xs text-gray-500">
              {isUserJoined && (
                <div className="flex items-center text-[#0F766E]">
                  <Users className="h-3 w-3 mr-1" />
                  You're in this game
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              {isUserJoined && type === "upcoming" && (
                <Button
                  onClick={() => setShowCancelDialog(true)}
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  style={{
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "180px",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Cancel Reservation
                </Button>
              )}
              <Button
                onClick={
                  type === "upcoming" &&
                  !isUserJoined &&
                  !userAlreadyJoinedOnDate
                    ? onJoinGame
                    : () => {}
                }
                variant={type === "past" ? "outline" : "default"}
                className={cn(
                  type === "past"
                    ? ""
                    : isUserJoined
                    ? "bg-gray-400 cursor-not-allowed"
                    : userAlreadyJoinedOnDate
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0F766E] hover:bg-[#0F766E]/90",
                  "transition-colors duration-200"
                )}
                disabled={
                  type === "upcoming" &&
                  (isUserJoined || userAlreadyJoinedOnDate)
                }
              >
                {type === "past"
                  ? "View Details"
                  : isUserJoined
                  ? "Already Joined"
                  : userAlreadyJoinedOnDate
                  ? "Already Booked Today"
                  : "Join Game"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showEditDialog && (
        <EditReservationDialog
          reservation={reservation}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
        />
      )}

      <CancelConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelConfirm}
        pitchName={reservation.pitchName}
      />
    </div>
  );
};

export default ReservationCard;
