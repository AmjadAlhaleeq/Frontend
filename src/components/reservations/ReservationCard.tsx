
import React, { useState } from "react";
import { format, parseISO } from 'date-fns';
import { MapPin, Users, Calendar, Clock, Info, AlertTriangle, UserPlus, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Reservation, useReservation } from "@/context/ReservationContext";
import GameDetailsDialog from "./GameDetailsDialog";

interface ReservationCardProps {
  reservation: Reservation;
  type: "upcoming" | "past";
  onJoinGame?: () => void;
  onCancelReservation?: () => void;
  onJoinWaitingList?: () => void;
  onLeaveWaitingList?: () => void;
  isUserJoined?: boolean;
  isUserOnWaitingList?: boolean;
  hasUserJoinedOnDate?: (date: string) => boolean;
  currentUserId: string;
  isAdmin?: boolean;
}

/**
 * ReservationCard component
 * Card displaying information about a reservation with actions
 * Shows different options based on type (upcoming/past) and user role
 */
const ReservationCard = ({
  reservation,
  type,
  onJoinGame,
  onCancelReservation,
  onJoinWaitingList,
  onLeaveWaitingList,
  isUserJoined,
  isUserOnWaitingList,
  hasUserJoinedOnDate,
  currentUserId,
  isAdmin = false
}: ReservationCardProps) => {
  const { toast } = useToast();
  const { updateReservationStatus } = useReservation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Format the date for display
  const formattedDate = format(parseISO(reservation.date), 'EEE, MMM d');
  
  // Calculate actual players total (adding +2 as requested)
  const actualMaxPlayers = reservation.maxPlayers + 2;
  
  // Maximum waiting list size
  const maxWaitingList = 3;
  
  // Determine if the waiting list is full
  const isWaitingListFull = reservation.waitingList.length >= maxWaitingList;

  // Determine the action button based on the user's current status and reservation status
  const renderActionButton = () => {
    // If the user is an admin, they cannot join games
    if (isAdmin) {
      return (
        <Button
          variant="default" 
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        >
          Manage Game
        </Button>
      );
    }

    // If the user is already in this game
    if (isUserJoined) {
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCancelReservation}
          className="w-full text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <UserMinus className="h-4 w-4 mr-1.5" />
          Leave Game
        </Button>
      );
    }
    
    // If the reservation is full but has a waiting list
    if (reservation.playersJoined >= actualMaxPlayers) {
      // User is on waiting list
      if (isUserOnWaitingList) {
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onLeaveWaitingList}
            className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
          >
            <UserMinus className="h-4 w-4 mr-1.5" />
            Leave Waiting List
          </Button>
        );
      }
      
      // Waiting list is available
      if (!isWaitingListFull) {
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onJoinWaitingList}
            className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            Join Waiting List
          </Button>
        );
      }
      
      // Waiting list is full
      return (
        <Button 
          variant="outline" 
          size="sm"
          disabled
          className="w-full opacity-70 cursor-not-allowed"
        >
          <AlertTriangle className="h-4 w-4 mr-1.5" />
          Game & Waiting List Full
        </Button>
      );
    }
    
    // User has already joined a different game on same date
    const hasOtherGameOnDate = hasUserJoinedOnDate && hasUserJoinedOnDate(reservation.date);
    if (hasOtherGameOnDate) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  className="w-full opacity-70 cursor-not-allowed"
                >
                  <Info className="h-4 w-4 mr-1.5" />
                  Already Booked
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>You already have a game booked on this date</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Default: User can join the game
    return (
      <Button 
        variant="default" 
        size="sm"
        onClick={onJoinGame}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        <UserPlus className="h-4 w-4 mr-1.5" />
        Join Game
      </Button>
    );
  };

  // For past games, show details button instead
  const pastGameButton = () => {
    if (isAdmin) {
      return (
        <Button
          variant="default" 
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        >
          Manage Game
        </Button>
      );
    }
    
    return (
      <Button
        variant="outline" 
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="w-full"
      >
        <Info className="h-4 w-4 mr-1.5" />
        Game Details
      </Button>
    );
  };

  // Handle reservation status change for admin
  const handleStatusChange = (newStatus: 'open' | 'full' | 'completed' | 'cancelled') => {
    if (isAdmin) {
      updateReservationStatus(reservation.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Game status changed to ${newStatus}`,
      });
    }
  };

  // Get status badge color based on reservation status
  const getStatusBadge = () => {
    switch (reservation.status) {
      case 'open':
        return <Badge className="bg-green-500">Open</Badge>;
      case 'full':
        return <Badge className="bg-amber-500">Full</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-medium text-teal-700 dark:text-teal-400 text-lg">
                {reservation.pitchName}
              </h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>{reservation.location}</span>
              </div>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-4 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-1.5" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 mr-1.5" />
              <span className="text-sm">{reservation.time}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-gray-500 mr-1.5" />
              <span className="text-sm">
                {reservation.playersJoined}/{actualMaxPlayers} players
              </span>
            </div>
          </div>

          {/* Show waiting list info if any players are on it */}
          {reservation.waitingList.length > 0 && (
            <div className="text-xs text-amber-600 dark:text-amber-400 mb-3 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {reservation.waitingList.length} {reservation.waitingList.length === 1 ? 'player' : 'players'} on waiting list
              {isWaitingListFull && " (Full)"}
            </div>
          )}

          {type === "upcoming" ? renderActionButton() : pastGameButton()}
        </div>
      </Card>

      <GameDetailsDialog 
        reservation={reservation}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isAdmin={isAdmin}
        onStatusChange={handleStatusChange}
        currentUserId={currentUserId}
        actualMaxPlayers={actualMaxPlayers}
      />
    </>
  );
};

export default ReservationCard;
