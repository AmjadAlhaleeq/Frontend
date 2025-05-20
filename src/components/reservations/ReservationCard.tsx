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
import JoinGameConfirmationDialog from "./JoinGameConfirmationDialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

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
 * Displays a reservation card with relevant information and actions based on user role and reservation status
 * Enhanced UX for joining, leaving games and managing waiting list
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
  const [isJoinConfirmOpen, setIsJoinConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showWaitingListConfirmation, setShowWaitingListConfirmation] = useState(false);
  
  // Format the date for display
  const formattedDate = format(parseISO(reservation.date), 'EEE, MMM d');
  const fullFormattedDate = format(parseISO(reservation.date), 'EEEE, MMMM d, yyyy');
  
  // Calculate actual players total
  const actualMaxPlayers = reservation.maxPlayers;
  
  // Maximum waiting list size
  const maxWaitingList = 3;
  
  // Determine if the waiting list is full
  const isWaitingListFull = reservation.waitingList.length >= maxWaitingList;
  
  // Handle join game confirmation - check if user is logged in
  const handleJoinGameClick = () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "You must be logged in to join a game.",
        variant: "destructive"
      });
      return;
    }
    setIsJoinConfirmOpen(true);
  };
  
  const handleJoinConfirm = () => {
    setIsJoinConfirmOpen(false);
    setIsLoading(true);
    
    if (onJoinGame) {
      onJoinGame();
      
      // Simulate loading for better UX
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Joined Successfully",
          description: "You have joined the game!",
        });
      }, 800);
    }
  };
  
  // Handle cancel reservation with login check
  const handleCancelReservation = () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "You must be logged in to leave a game.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    if (onCancelReservation) {
      onCancelReservation();
      
      // Simulate loading for better UX
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Left Game",
          description: "You've been removed from the game",
        });
      }, 800);
    }
  };
  
  // Handle leave game confirmation
  const handleLeaveGameClick = () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "You must be logged in to leave a game.",
        variant: "destructive"
      });
      return;
    }
    
    // Open leave confirmation dialog
    setShowLeaveConfirmation(true);
  };
  
  const handleLeaveGameConfirm = () => {
    setShowLeaveConfirmation(false);
    setIsLoading(true);
    
    if (onCancelReservation) {
      onCancelReservation();
      
      // Simulate loading for better UX
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Left Game",
          description: reservation.waitingList.length > 0 
            ? "You've been removed from the game and the first player on the waiting list has been notified" 
            : "You've been removed from the game",
        });
      }, 800);
    }
  };
  
  // Handle join waiting list confirmation
  const handleJoinWaitingListClick = () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "You must be logged in to join the waiting list.",
        variant: "destructive"
      });
      return;
    }
    
    setShowWaitingListConfirmation(true);
  };
  
  const handleJoinWaitingListConfirm = () => {
    setShowWaitingListConfirmation(false);
    setIsLoading(true);
    
    if (onJoinWaitingList) {
      onJoinWaitingList();
      
      // Simulate loading for better UX
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Added to Waiting List",
          description: "You'll be notified if a spot becomes available",
        });
      }, 800);
    }
  };
  
  // Handle leave waiting list with login check
  const handleLeaveWaitingList = () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "You must be logged in to leave the waiting list.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    if (onLeaveWaitingList) {
      onLeaveWaitingList();
      
      // Simulate loading for better UX
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Removed from Waiting List",
          description: "You've been removed from the waiting list",
        });
      }, 800);
    }
  };

  // Determine the action button based on the user's current status and reservation status
  const renderActionButton = () => {
    // If the user is an admin, they can manage the game
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
    
    // Check if user is suspended
    const isSuspended = false; // This would come from user context in a real implementation
    
    if (isSuspended) {
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
                  <AlertTriangle className="h-4 w-4 mr-1.5" />
                  Account Suspended
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your account has been suspended. Contact an admin.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // If the user is already in this game
    if (isUserJoined) {
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLeaveGameClick}
          disabled={isLoading}
          className="w-full text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <>
              <UserMinus className="h-4 w-4 mr-1.5" />
              Leave Game
            </>
          )}
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
            onClick={handleLeaveWaitingList}
            disabled={isLoading}
            className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <UserMinus className="h-4 w-4 mr-1.5" />
                Leave Waiting List
              </>
            )}
          </Button>
        );
      }
      
      // Waiting list is available
      if (!isWaitingListFull) {
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleJoinWaitingListClick}
            disabled={isLoading}
            className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1.5" />
                Join Waiting List
              </>
            )}
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
        onClick={handleJoinGameClick}
        disabled={isLoading}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Join Game
          </>
        )}
      </Button>
    );
  };

  // For past games, show details button instead
  const pastGameButton = () => {
    // Same display for admin and players for past games
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
          {/* Pitch image - new addition */}
          {reservation.imageUrl && (
            <div className="h-32 -mx-4 -mt-4 mb-3 relative">
              <img 
                src={reservation.imageUrl || "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3"} 
                alt={reservation.pitchName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-2 left-4 text-white">
                <h3 className="font-medium text-lg">{reservation.title || reservation.pitchName}</h3>
              </div>
            </div>
          )}

          {/* If no image, show the title normally */}
          {!reservation.imageUrl && (
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-teal-700 dark:text-teal-400 text-lg">
                  {reservation.title || reservation.pitchName}
                </h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{reservation.location}</span>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          )}
          
          {/* If there's an image, show the badge separately */}
          {reservation.imageUrl && (
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>{reservation.location}</span>
              </div>
              {getStatusBadge()}
            </div>
          )}
          
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
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isAdmin={isAdmin}
        onStatusChange={handleStatusChange}
        currentUserId={currentUserId}
        actualMaxPlayers={actualMaxPlayers}
      />
      
      <JoinGameConfirmationDialog
        isOpen={isJoinConfirmOpen}
        onClose={() => setIsJoinConfirmOpen(false)}
        onConfirm={handleJoinConfirm}
        gameName={reservation.title || reservation.pitchName}
        gameDate={fullFormattedDate}
        gameTime={reservation.time}
      />

      {/* New: Leave Game Confirmation Dialog */}
      <AlertDialog open={showLeaveConfirmation} onOpenChange={setShowLeaveConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Game</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this game?
              {reservation.waitingList.length > 0 && " The first player on the waiting list will be notified."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGameConfirm} className="bg-red-600 hover:bg-red-700">
              Leave Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New: Join Waiting List Confirmation Dialog */}
      <AlertDialog open={showWaitingListConfirmation} onOpenChange={setShowWaitingListConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Join Waiting List</AlertDialogTitle>
            <AlertDialogDescription>
              This game is currently full. By joining the waiting list, you'll be notified if a spot becomes available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleJoinWaitingListConfirm} className="bg-amber-600 hover:bg-amber-700">
              Join Waiting List
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReservationCard;
