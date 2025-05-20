
import React, { useState } from "react";
import { format, parseISO } from 'date-fns';
import { MapPin, Users, Calendar, Clock, AlertTriangle, UserPlus, UserMinus, ExternalLink, Trash2, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Reservation, useReservation } from "@/context/ReservationContext";
import GameDetailsDialog from "./GameDetailsDialog";
import JoinGameConfirmationDialog from "./JoinGameConfirmationDialog";
import ActionConfirmationDialog from "./ActionConfirmationDialog";

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
 * Displays information about a game reservation
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
  const { updateReservationStatus, deleteReservation } = useReservation();
  const [isGameDetailsOpen, setIsGameDetailsOpen] = useState(false);
  const [isJoinConfirmOpen, setIsJoinConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for generic action confirmation
  const [actionConfirmState, setActionConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmVariant?: "default" | "destructive";
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} });
  
  const formattedDate = format(parseISO(reservation.date), 'EEE, MMM d');
  const fullFormattedDate = format(parseISO(reservation.date), 'EEEE, MMMM d, yyyy');
  const actualMaxPlayers = reservation.maxPlayers;
  const maxWaitingList = 3;
  const isWaitingListFull = reservation.waitingList.length >= maxWaitingList;

  // Calculate progress percentage for player count
  const playerCountPercentage = Math.min(
    (reservation.playersJoined / actualMaxPlayers) * 100,
    100
  );

  // Get image for reservation
  const reservationImage = reservation.imageUrl || `https://source.unsplash.com/400x200/?soccer,football,${reservation.pitchName.split(" ").join(",")}`;

  const handleMainCardClick = () => {
    setIsGameDetailsOpen(true);
  };
  
  const handleJoinGameClick = () => {
    if (!currentUserId) {
      toast({ title: "Login Required", description: "You must be logged in to join a game.", variant: "destructive" });
      return;
    }
    setIsJoinConfirmOpen(true);
  };
  
  const handleJoinConfirm = () => {
    setIsJoinConfirmOpen(false);
    if (!onJoinGame) return;
    setIsLoading(true);
    onJoinGame();
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: "Joined Successfully", description: "You have joined the game!" });
    }, 800);
  };
  
  const confirmAndExecute = (
    actionFn: (() => void) | undefined,
    title: string,
    description: string,
    successMessage: string,
    confirmText?: string,
    confirmVariant?: "default" | "destructive"
  ) => {
    if (!currentUserId) {
      toast({ title: "Login Required", description: "You must be logged in for this action.", variant: "destructive" });
      return;
    }
    if (!actionFn) return;

    setActionConfirmState({
      isOpen: true,
      title,
      description,
      onConfirm: () => {
        setActionConfirmState({ ...actionConfirmState, isOpen: false });
        setIsLoading(true);
        actionFn();
        setTimeout(() => {
          setIsLoading(false);
          toast({ title: successMessage.split(':')[0], description: successMessage.split(':')[1] || "" });
        }, 800);
      },
      confirmText,
      confirmVariant
    });
  };

  const handleDeleteReservation = () => {
    if (!isAdmin) return;
    
    setActionConfirmState({
      isOpen: true,
      title: "Delete Reservation?",
      description: "This will permanently delete the reservation and cannot be undone. All players will be removed.",
      confirmText: "Yes, Delete",
      confirmVariant: "destructive",
      onConfirm: () => {
        setActionConfirmState({ ...actionConfirmState, isOpen: false });
        setIsDeleting(true);
        
        // Simulate API call
        setTimeout(() => {
          deleteReservation(reservation.id);
          setIsDeleting(false);
          toast({ 
            title: "Reservation Deleted", 
            description: `The reservation for "${reservation.title || reservation.pitchName}" has been deleted.` 
          });
        }, 1000);
      }
    });
  };

  const handleCancelReservationAction = () => {
    confirmAndExecute(
      onCancelReservation,
      "Leave Game?",
      "Are you sure you want to leave this game? This action cannot be undone.",
      "Left Game:You've been removed from the game.",
      "Yes, Leave Game",
      "destructive"
    );
  };

  const handleJoinWaitingListAction = () => {
    confirmAndExecute(
      onJoinWaitingList,
      "Join Waiting List?",
      "The game is full. Do you want to join the waiting list? You'll be notified if a spot opens up.",
      "Added to Waiting List:You're now on the waiting list.",
      "Join Waiting List"
    );
  };

  const handleLeaveWaitingListAction = () => {
    confirmAndExecute(
      onLeaveWaitingList,
      "Leave Waiting List?",
      "Are you sure you want to leave the waiting list for this game?",
      "Removed from Waiting List:You've been removed from the waiting list.",
      "Yes, Leave List",
      "destructive"
    );
  };

  const renderActionButton = () => {
    if (isAdmin && type === "upcoming") { 
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteReservation();
            }} 
            className="w-full text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader className="h-4 w-4 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete Reservation
              </>
            )}
          </Button>
        );
    }

    if (isUserJoined) {
      return <Button variant="outline" size="sm" onClick={handleCancelReservationAction} disabled={isLoading} className="w-full text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600">{isLoading ? "Processing..." : <><UserMinus className="h-4 w-4 mr-1.5" />Leave Game</>}</Button>;
    }
    
    if (reservation.playersJoined >= actualMaxPlayers) {
      if (isUserOnWaitingList) {
        return <Button variant="outline" size="sm" onClick={handleLeaveWaitingListAction} disabled={isLoading} className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600">{isLoading ? "Processing..." : <><UserMinus className="h-4 w-4 mr-1.5" />Leave Waiting List</>}</Button>;
      }
      if (!isWaitingListFull) {
        return <Button variant="outline" size="sm" onClick={handleJoinWaitingListAction} disabled={isLoading} className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600">{isLoading ? "Processing..." : <><UserPlus className="h-4 w-4 mr-1.5" />Join Waiting List</>}</Button>;
      }
      return <Button variant="outline" size="sm" disabled className="w-full opacity-70 cursor-not-allowed"><AlertTriangle className="h-4 w-4 mr-1.5" />Game & List Full</Button>;
    }
    
    const hasOtherGameOnDate = hasUserJoinedOnDate && hasUserJoinedOnDate(reservation.date);
    if (hasOtherGameOnDate) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild><div className="w-full"><Button variant="outline" size="sm" disabled className="w-full opacity-70 cursor-not-allowed"><AlertTriangle className="h-4 w-4 mr-1.5" />Already Booked</Button></div></TooltipTrigger>
            <TooltipContent><p>You already have a game booked on this date.</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return <Button variant="default" size="sm" onClick={handleJoinGameClick} disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white">{isLoading ? "Processing..." : <><UserPlus className="h-4 w-4 mr-1.5" />Join Game</>}</Button>;
  };

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
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <div className="relative h-40 sm:h-48 w-full cursor-pointer" onClick={handleMainCardClick}>
            <img 
              src={reservationImage} 
              alt={reservation.title || reservation.pitchName} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-3 flex flex-col justify-end">
                <h3 className="font-semibold text-white text-md sm:text-lg line-clamp-2 leading-tight">
                    {reservation.title || reservation.pitchName}
                </h3>
            </div>
            <div className="absolute top-2 right-2">
                {getStatusBadge()}
            </div>
        </div>

        <div className="p-4">
          <div 
            className="space-y-2 mb-3 cursor-pointer"
            onClick={handleMainCardClick}
          >
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              {reservation.location ? (
                <div className="flex flex-col">
                  <span className="truncate">{reservation.city || "Unknown location"}</span>
                  {reservation.locationLink && (
                    <a 
                      href={reservation.locationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View on Maps <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              ) : (
                <span className="truncate">{reservation.location || "Not specified"}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-1.5 flex-shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-1.5 flex-shrink-0" />
                <span>{reservation.time}</span>
              </div>
              <div className="flex items-center col-span-2">
                <Users className="h-4 w-4 text-gray-500 mr-1.5 flex-shrink-0" />
                <span>
                  {reservation.playersJoined}/{actualMaxPlayers} players
                </span>
              </div>
            </div>
            
            {/* Player progress bar */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-medium ${playerCountPercentage >= 75 ? 'text-amber-600' : 'text-teal-600'}`}>
                  {playerCountPercentage === 100 ? 'Full!' : `${Math.round(playerCountPercentage)}% full`}
                </span>
                <span className="text-gray-500">
                  {reservation.playersJoined} joined
                </span>
              </div>
              <Progress 
                value={playerCountPercentage} 
                className="h-1.5" 
                indicatorClassName={`${playerCountPercentage < 50 ? 'bg-teal-500' : playerCountPercentage < 75 ? 'bg-amber-500' : 'bg-red-500'}`}
              />
            </div>
          </div>

          {reservation.waitingList.length > 0 && type === "upcoming" && (
            <div className="text-xs text-amber-600 dark:text-amber-400 mb-3 flex items-center" onClick={handleMainCardClick}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {reservation.waitingList.length} {reservation.waitingList.length === 1 ? 'player' : 'players'} on waiting list
              {isWaitingListFull && " (Full)"}
            </div>
          )}

          {type === "upcoming" && renderActionButton()}
        </div>
      </Card>

      <GameDetailsDialog 
        reservation={reservation}
        isOpen={isGameDetailsOpen}
        onClose={() => setIsGameDetailsOpen(false)}
        isAdmin={isAdmin}
        onStatusChange={(status) => {
          if (isAdmin && reservation) {
            updateReservationStatus(reservation.id, status);
            toast({
              title: "Status Updated",
              description: `Reservation status changed to ${status}`
            });
          }
        }}
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

      <ActionConfirmationDialog
        open={actionConfirmState.isOpen}
        onOpenChange={(open) => setActionConfirmState({ ...actionConfirmState, isOpen: open })}
        onConfirm={actionConfirmState.onConfirm}
        title={actionConfirmState.title}
        description={actionConfirmState.description}
        confirmButtonText={actionConfirmState.confirmText}
        confirmButtonVariant={actionConfirmState.confirmVariant}
      />
    </>
  );
};

export default ReservationCard;
