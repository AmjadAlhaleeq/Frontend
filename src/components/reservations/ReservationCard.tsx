import React, { useState } from "react";
import { format, parseISO } from 'date-fns';
import { MapPin, Users, Calendar, Clock, AlertTriangle, UserPlus, UserMinus, ExternalLink, Trash2, Loader, Ban } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Reservation } from "@/context/ReservationContext";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import SuspendPlayerDialog from "@/components/reservations/SuspendPlayerDialog";
import { sendGameCancellationNotification, sendWaitingListNotification } from "@/utils/emailNotifications";

interface ReservationCardProps {
  reservation: Reservation;
  type: "upcoming" | "past" | "admin";
  onJoinGame: () => void;
  onCancelReservation: () => void;
  onJoinWaitingList: () => void;
  onLeaveWaitingList: () => void;
  isUserJoined: boolean;
  isUserOnWaitingList: boolean;
  hasUserJoinedOnDate: (date: string) => boolean;
  currentUserId: string;
  isAdmin?: boolean;
  onDeleteReservation?: (id: number) => void;
}

/**
 * ReservationCard component
 * Displays details about a game reservation with actions based on user role
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
  isAdmin = false,
  onDeleteReservation
}) => {
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isWaitlistJoining, setIsWaitlistJoining] = useState(false);
  const [isWaitlistLeaving, setIsWaitlistLeaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>("");
  const [selectedPlayerEmail, setSelectedPlayerEmail] = useState<string>("");

  // Format date with error handling
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
    } catch (error) {
      console.error("Error parsing date:", error);
      return dateString;
    }
  };

  // Handle joining a game
  const handleJoinGame = async () => {
    if (hasUserJoinedOnDate(reservation.date) && !isUserJoined) {
      toast({
        title: "Already joined a game on this date",
        description: "You can only join one game per day",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      await onJoinGame();
      toast({
        title: "Success!",
        description: "You've joined the game",
      });
    } catch (error) {
      console.error("Error joining game:", error);
      toast({
        title: "Failed to join",
        description: "There was a problem joining the game",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Handle leaving a game
  const handleCancelReservation = async () => {
    setIsLeaving(true);
    try {
      await onCancelReservation();
      
      // If there are people on the waiting list, send notification
      if (reservation.waitingList.length > 0) {
        // In a real app, you'd get the emails from user profiles
        // For demo, we'll create dummy emails from user IDs
        const waitingListEmails = reservation.waitingList.map(userId => {
          // This is a dummy implementation - in real app, get actual emails
          return `player-${userId}@example.com`;
        });
        
        // Create join URL - in real app this would point to your app with appropriate params
        const joinUrl = `${window.location.origin}/reservations?game=${reservation.id}&action=join`;
        
        // Send notification to waiting list
        await sendWaitingListNotification(
          {
            id: reservation.id,
            title: reservation.title || reservation.pitchName,
            date: formatDate(reservation.date),
            time: reservation.time,
            location: reservation.location || ""
          },
          waitingListEmails,
          joinUrl
        );
      }
      
      toast({
        title: "Reservation cancelled",
        description: "You've left the game",
      });
    } catch (error) {
      console.error("Error leaving game:", error);
      toast({
        title: "Failed to leave",
        description: "There was a problem cancelling your reservation",
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
    }
  };

  // Handle joining waiting list
  const handleJoinWaitingList = async () => {
    setIsWaitlistJoining(true);
    try {
      await onJoinWaitingList();
      toast({
        title: "Added to waiting list",
        description: "You've been added to the waiting list",
      });
    } catch (error) {
      console.error("Error joining waiting list:", error);
      toast({
        title: "Failed to join",
        description: "There was a problem joining the waiting list",
        variant: "destructive",
      });
    } finally {
      setIsWaitlistJoining(false);
    }
  };

  // Handle leaving waiting list
  const handleLeaveWaitingList = async () => {
    setIsWaitlistLeaving(true);
    try {
      await onLeaveWaitingList();
      toast({
        title: "Removed from waiting list",
        description: "You've been removed from the waiting list",
      });
    } catch (error) {
      console.error("Error leaving waiting list:", error);
      toast({
        title: "Failed to leave",
        description: "There was a problem leaving the waiting list",
        variant: "destructive",
      });
    } finally {
      setIsWaitlistLeaving(false);
    }
  };

  // Handle deleting a reservation (admin only)
  const handleDeleteReservation = async () => {
    if (!onDeleteReservation) return;
    
    setIsDeleting(true);
    try {
      // Get emails for all players in the lineup
      const playerEmails = reservation.lineup.map(player => {
        // This is a dummy implementation - in real app, get actual emails
        return `player-${player.userId}@example.com`;
      });
      
      // Send cancellation emails
      await sendGameCancellationNotification(
        {
          title: reservation.title || reservation.pitchName,
          date: formatDate(reservation.date),
          time: reservation.time,
          location: reservation.location || ""
        },
        playerEmails
      );
      
      // Delete the reservation
      onDeleteReservation(reservation.id);
      
      toast({
        title: "Reservation deleted",
        description: "The reservation has been deleted and players notified",
      });
      
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast({
        title: "Failed to delete",
        description: "There was a problem deleting the reservation",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Open suspend player dialog
  const openSuspendDialog = (userId: string, playerName: string) => {
    setSelectedPlayerId(userId);
    setSelectedPlayerName(playerName);
    // In a real app, get the actual email from user profile
    setSelectedPlayerEmail(`player-${userId}@example.com`);
    setShowSuspendDialog(true);
  };

  // Calculate percentage of players joined vs max players
  const playerCountPercentage = Math.min(
    Math.round((reservation.playersJoined / reservation.maxPlayers) * 100),
    100
  );

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500 hover:bg-green-600";
      case "full":
        return "bg-amber-500 hover:bg-amber-600";
      case "completed":
        return "bg-blue-500 hover:bg-blue-600";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">
              {reservation.title || reservation.pitchName}
            </CardTitle>
            <CardDescription>
              {formatDate(reservation.date)}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(reservation.status)}>{reservation.status}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{reservation.time}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{reservation.location || reservation.pitchName}</span>
            {reservation.locationLink && (
              <a 
                href={reservation.locationLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-teal-600 hover:text-teal-700"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{reservation.city || "N/A"}</span>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {reservation.playersJoined} / {reservation.maxPlayers} players
                </span>
              </div>
              
              <span className="text-xs text-muted-foreground">
                {reservation.playersJoined === reservation.maxPlayers ? "Full" : 
                  `${reservation.maxPlayers - reservation.playersJoined} spots left`}
              </span>
            </div>
            <div className="w-full">
              <Progress 
                value={playerCountPercentage} 
                className="h-1.5"
                indicatorColor={playerCountPercentage < 50 ? "green" : playerCountPercentage < 75 ? "amber" : "red"}
              />
            </div>
          </div>
          
          {reservation.waitingList && reservation.waitingList.length > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
              <span>{reservation.waitingList.length} on waiting list</span>
            </div>
          )}
          
          {/* Player lineup (admin view) */}
          {isAdmin && reservation.lineup && reservation.lineup.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Players:</h4>
              <div className="flex flex-wrap gap-1">
                {reservation.lineup.map((player) => (
                  <TooltipProvider key={player.userId}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Avatar className="h-8 w-8 border border-muted">
                            <AvatarFallback className="text-xs">
                              {player.playerName?.substring(0, 2) || player.userId.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-100 hover:bg-red-200 p-0"
                              onClick={() => openSuspendDialog(player.userId, player.playerName || "Player")}
                            >
                              <Ban className="h-3 w-3 text-red-600" />
                              <span className="sr-only">Suspend player</span>
                            </Button>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">{player.playerName || "Player"}</p>
                          <p className="text-muted-foreground">Status: {player.status}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        {type === "upcoming" && !isAdmin && (
          <>
            {isUserJoined ? (
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700"
                onClick={handleCancelReservation}
                disabled={isLeaving}
              >
                {isLeaving ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserMinus className="mr-2 h-4 w-4" />
                )}
                {isLeaving ? "Leaving..." : "Leave Game"}
              </Button>
            ) : reservation.status === "full" ? (
              isUserOnWaitingList ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleLeaveWaitingList}
                  disabled={isWaitlistLeaving}
                >
                  {isWaitlistLeaving ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserMinus className="mr-2 h-4 w-4" />
                  )}
                  {isWaitlistLeaving ? "Leaving..." : "Leave Waiting List"}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleJoinWaitingList}
                  disabled={isWaitlistJoining}
                >
                  {isWaitlistJoining ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  {isWaitlistJoining ? "Joining..." : "Join Waiting List"}
                </Button>
              )
            ) : hasUserJoinedOnDate(reservation.date) && !isUserJoined ? (
              <Button 
                variant="outline" 
                className="w-full"
                disabled={true}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Already Joined Game on This Date
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="w-full bg-teal-600 hover:bg-teal-700"
                onClick={handleJoinGame}
                disabled={isJoining}
              >
                {isJoining ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {isJoining ? "Joining..." : "Join Game"}
              </Button>
            )}
          </>
        )}
        
        {isAdmin && onDeleteReservation && (
          <Button 
            variant="outline" 
            className="w-full text-red-600 hover:text-red-700"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Reservation
          </Button>
        )}
      </CardFooter>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteReservation}
          itemName={reservation.title || reservation.pitchName}
          itemType="reservation"
        />
      )}
      
      {/* Suspend Player Dialog */}
      {showSuspendDialog && (
        <SuspendPlayerDialog
          isOpen={showSuspendDialog}
          onClose={() => setShowSuspendDialog(false)}
          playerId={selectedPlayerId}
          playerName={selectedPlayerName}
          playerEmail={selectedPlayerEmail}
        />
      )}
    </Card>
  );
};

export default ReservationCard;
