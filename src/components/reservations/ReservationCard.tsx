
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarDays,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  UserPlus,
  UserMinus,
  ExternalLink,
  FileText,
  Eye,
  Trash2,
  Trophy,
  AlertTriangle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, addHours } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Reservation } from "@/context/ReservationContext";
import JoinGameConfirmationDialog from "@/components/reservations/JoinGameConfirmationDialog";
import LeaveGameDialog from "@/components/reservations/LeaveGameDialog";
import WaitlistConfirmationDialog from "@/components/reservations/WaitlistConfirmationDialog";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ReservationCardProps {
  reservation: Reservation;
  type: "upcoming" | "past";
  onJoinGame: () => void;
  onCancelReservation: () => void;
  onJoinWaitingList: () => void;
  onLeaveWaitingList: () => void;
  isUserJoined: boolean;
  isUserOnWaitingList: boolean;
  hasUserJoinedOnDate: (dateString: string) => boolean;
  currentUserId: string;
  isAdmin: boolean;
  onDeleteReservation?: (id: number) => void;
  onAddSummary?: (reservation: Reservation) => void;
  hasSummary?: boolean;
  showWaitlist?: boolean;
}

/**
 * ReservationCard component for displaying a game reservation in the list
 */
const ReservationCard: React.FC<ReservationCardProps> = ({
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
  isAdmin,
  onDeleteReservation,
  onAddSummary,
  hasSummary,
  showWaitlist = false,
}) => {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isJoinWaitlistDialogOpen, setIsJoinWaitlistDialogOpen] = useState(false);
  const [isLeaveWaitlistDialogOpen, setIsLeaveWaitlistDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Format dates and calculate time remaining
  const formatDate = (dateString: string, includeWeekday = false) => {
    try {
      return format(parseISO(dateString), includeWeekday ? 'EEEE, MMMM d' : 'MMMM d');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Parse the date and time strings to create a full Date object
  const getGameDateTime = (): Date => {
    try {
      // Extract hour and minute from time string (e.g., "14:30" -> 14, 30)
      const [hour, minute] = reservation.time.split(':').map(Number);
      const gameDate = parseISO(reservation.date);
      return new Date(
        gameDate.getFullYear(),
        gameDate.getMonth(),
        gameDate.getDate(),
        hour,
        minute || 0
      );
    } catch (error) {
      console.error("Error parsing game date and time:", error);
      return new Date(); // Fallback to current time
    }
  };

  // Check if the game is within 2 hours
  const isWithinTwoHours = (): boolean => {
    const gameDateTime = getGameDateTime();
    const twoHoursBefore = addHours(new Date(), -2);
    return isAfter(gameDateTime, new Date()) && isBefore(gameDateTime, twoHoursBefore);
  };

  // Calculate time remaining until game
  const getTimeRemaining = (): string => {
    try {
      const gameDateTime = getGameDateTime();
      const now = new Date();
      
      if (isAfter(now, gameDateTime)) {
        return "Game has started";
      }

      const diffMs = gameDateTime.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 24) {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
      }
      
      return `${diffHours}h ${diffMinutes}m remaining`;
    } catch (error) {
      console.error("Error calculating time remaining:", error);
      return "Time unknown";
    }
  };

  // Check if user has already joined a game on the same date
  const hasConflict = !isUserJoined && 
    !isAdmin && 
    currentUserId && 
    hasUserJoinedOnDate(reservation.date);

  // Calculate the waitlist position if user is on waitlist
  const getWaitlistPosition = (): number | null => {
    if (!isUserOnWaitingList || !reservation.waitingList) return null;
    return reservation.waitingList.indexOf(currentUserId) + 1;
  };
  
  // Get color based on reservation status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500 hover:bg-green-600";
      case "full": return "bg-amber-500 hover:bg-amber-600";
      case "completed": return "bg-blue-500 hover:bg-blue-600";
      case "cancelled": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };
  
  const handleViewDetails = () => {
    navigate(`/reservation/${reservation.id}`);
  };
  
  const handleDeleteReservation = async () => {
    if (!onDeleteReservation) return;
    
    setIsProcessing(true);
    
    try {
      onDeleteReservation(reservation.id);
      toast({
        title: "Reservation Deleted",
        description: `"${reservation.title || reservation.pitchName}" has been deleted.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reservation.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleJoinGame = async () => {
    setIsProcessing(true);
    try {
      onJoinGame();
      toast({
        title: "Success!",
        description: "You've joined the game"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join game.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsJoinDialogOpen(false);
    }
  };
  
  const handleLeaveGame = async () => {
    setIsProcessing(true);
    try {
      onCancelReservation();
      toast({
        title: "Left Game",
        description: "You've left the game"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave game.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsLeaveDialogOpen(false);
    }
  };
  
  const handleJoinWaitlist = async () => {
    setIsProcessing(true);
    try {
      onJoinWaitingList();
      toast({
        title: "Joined Waitlist",
        description: "You've been added to the waiting list"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join waiting list.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsJoinWaitlistDialogOpen(false);
    }
  };
  
  const handleLeaveWaitlist = async () => {
    setIsProcessing(true);
    try {
      onLeaveWaitingList();
      toast({
        title: "Left Waitlist",
        description: "You've been removed from the waiting list"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave waiting list.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsLeaveWaitlistDialogOpen(false);
    }
  };
  
  const handleAddSummary = () => {
    if (onAddSummary) {
      onAddSummary(reservation);
    }
  };

  const waitlistPosition = getWaitlistPosition();
  const isPenalty = isWithinTwoHours();
  const timeRemaining = getTimeRemaining();

  return (
    <>
      <Card className="overflow-hidden transition hover:shadow-md">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="flex items-start">
                <span className="text-lg font-semibold line-clamp-1">
                  {reservation.title || reservation.pitchName}
                </span>
              </CardTitle>
              <CardDescription className="flex items-center">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                {formatDate(reservation.date, true)}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(reservation.status)}>
              {reservation.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{reservation.time}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{reservation.playersJoined} / {reservation.maxPlayers} players</span>
            </div>
            {reservation.city && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{reservation.city}</span>
              </div>
            )}
            {reservation.location && (
              <div className="flex items-start sm:items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5 sm:mt-0" />
                <a 
                  href={reservation.location}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline flex items-center"
                >
                  View on Maps
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </div>

          {/* User status indicators */}
          {(isUserJoined || isUserOnWaitingList || hasConflict) && (
            <>
              <Separator className="my-2" />
              <div className="flex items-center">
                {isUserJoined && (
                  <div className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    You're in this game
                  </div>
                )}
                {isUserOnWaitingList && (
                  <div className="flex items-center text-amber-600 dark:text-amber-400 text-xs font-medium">
                    <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                    Waitlist position: {waitlistPosition}
                  </div>
                )}
                {hasConflict && !isUserJoined && !isUserOnWaitingList && (
                  <div className="flex items-center text-amber-600 dark:text-amber-400 text-xs font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    You're already in another game on this date
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Completed game summary teaser */}
          {reservation.status === "completed" && reservation.summary && (
            <>
              <Separator className="my-2" />
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                <div className="flex items-center text-blue-700 dark:text-blue-400 text-xs font-medium mb-1">
                  <Trophy className="h-3.5 w-3.5 mr-1.5" />
                  Game Summary
                </div>
                {reservation.summary.finalScore && (
                  <div className="text-sm font-medium">Score: {reservation.summary.finalScore}</div>
                )}
              </div>
            </>
          )}
          
          {/* Waitlist indicator */}
          {(showWaitlist || isAdmin) && reservation.waitingList && reservation.waitingList.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="flex items-center text-amber-600 dark:text-amber-400 text-xs font-medium">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                {reservation.waitingList.length} player{reservation.waitingList.length !== 1 ? 's' : ''} on waitlist
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-2 flex flex-wrap gap-2">
          {type === "upcoming" ? (
            <>
              {/* Button for joining a game */}
              {!isUserJoined && reservation.status === "open" && !isAdmin && currentUserId && (
                <Button 
                  onClick={() => {
                    if (hasConflict) {
                      toast({
                        title: "Schedule Conflict",
                        description: "You already have a game on this date.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setIsJoinDialogOpen(true);
                  }}
                  size="sm"
                  disabled={hasConflict || isProcessing}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isProcessing ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      Join Game
                    </>
                  )}
                </Button>
              )}
              
              {/* Button for leaving a game */}
              {isUserJoined && !isAdmin && (
                <Button 
                  onClick={() => setIsLeaveDialogOpen(true)}
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:text-red-600"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserMinus className="h-4 w-4 mr-1.5" />
                      Leave Game
                    </>
                  )}
                </Button>
              )}
              
              {/* Button for joining waitlist */}
              {!isUserJoined && !isUserOnWaitingList && reservation.status === "full" && !isAdmin && currentUserId && (
                <Button 
                  onClick={() => setIsJoinWaitlistDialogOpen(true)}
                  size="sm"
                  variant="outline"
                  className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-400/50 dark:hover:bg-amber-900/20"
                  disabled={hasConflict || isProcessing}
                >
                  {isProcessing ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-1.5" />
                      Join Waitlist
                    </>
                  )}
                </Button>
              )}
              
              {/* Button for leaving waitlist */}
              {isUserOnWaitingList && !isAdmin && (
                <Button 
                  onClick={() => setIsLeaveWaitlistDialogOpen(true)}
                  size="sm"
                  variant="outline"
                  className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-400/50 dark:hover:bg-amber-900/20"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserMinus className="h-4 w-4 mr-1.5" />
                      Leave Waitlist
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            // Past game actions
            isAdmin && !hasSummary && (
              <Button
                onClick={handleAddSummary}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileText className="h-4 w-4 mr-1.5" />
                Add Summary
              </Button>
            )
          )}
          
          {/* Common buttons for all types */}
          <Button 
            onClick={handleViewDetails}
            size="sm"
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            View Details
          </Button>
          
          {/* Admin delete button */}
          {isAdmin && onDeleteReservation && (
            <Button 
              onClick={() => setIsDeleteDialogOpen(true)}
              size="sm"
              variant="outline"
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Join Game Confirmation Dialog */}
      <JoinGameConfirmationDialog
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
        onConfirm={handleJoinGame}
        gameName={reservation.title || reservation.pitchName}
        gameDate={formatDate(reservation.date, true)}
        gameTime={reservation.time}
      />
      
      {/* Leave Game Dialog */}
      <LeaveGameDialog 
        isOpen={isLeaveDialogOpen}
        onClose={() => setIsLeaveDialogOpen(false)}
        onConfirm={handleLeaveGame}
        gameName={reservation.title || reservation.pitchName}
        gameDate={formatDate(reservation.date, true)}
        gameTime={reservation.time}
        isPenalty={isPenalty}
        timeToGame={timeRemaining}
      />
      
      {/* Waitlist Confirmation Dialog */}
      <WaitlistConfirmationDialog 
        isOpen={isJoinWaitlistDialogOpen}
        onClose={() => setIsJoinWaitlistDialogOpen(false)}
        onConfirm={handleJoinWaitlist}
        gameTitle={reservation.title || reservation.pitchName}
        isJoining={true}
      />
      
      {/* Leave Waitlist Confirmation Dialog */}
      <WaitlistConfirmationDialog 
        isOpen={isLeaveWaitlistDialogOpen}
        onClose={() => setIsLeaveWaitlistDialogOpen(false)}
        onConfirm={handleLeaveWaitlist}
        gameTitle={reservation.title || reservation.pitchName}
        isJoining={false}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteReservation}
        itemName={reservation.title || reservation.pitchName}
        itemType="reservation"
        isDeleting={isProcessing}
      />
    </>
  );
};

export default ReservationCard;
