
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useReservation, Reservation } from "@/context/ReservationContext";
import { MapPin, Calendar, Clock, Users, Trash2 } from "lucide-react";
import GameSummaryDialog from "./GameSummaryDialog";

// Import Player from context
import { Player as ReservationPlayer } from "@/context/ReservationContext";

interface Player extends ReservationPlayer {
  email?: string;
}

interface ReservationCardProps {
  reservation: Reservation;
  userId: string;
  userRole?: string;
  onJoin: (id: number, playerName?: string, userId?: string) => void;
  onCancel: (id: number, userId: string) => void;
  onJoinWaitingList: (id: number, userId: string) => void;
  onLeaveWaitingList: (id: number, userId: string) => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  isFull: boolean;
  suspendPlayer?: (userId: string, reason: string, duration: number) => void;
  kickPlayerFromGame?: (reservationId: number, userId: string) => void;
  onDeleteReservation?: (id: number) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  userId,
  userRole = "player",
  onJoin,
  onCancel,
  onJoinWaitingList,
  onLeaveWaitingList,
  isUserJoined,
  isFull,
  suspendPlayer,
  kickPlayerFromGame,
  onDeleteReservation,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);

  const { updateGameSummary } = useReservation();

  // Determine game status based on time
  const determineGameStatus = () => {
    try {
      const gameDate = new Date(reservation.date);
      const [startHour, startMinute] = reservation.startTime?.split(':').map(Number) || 
                                      reservation.time?.split(' - ')[0].split(':').map(Number) || [0, 0];
      const gameStartTime = new Date(gameDate);
      gameStartTime.setHours(startHour, startMinute, 0, 0);
      
      // Add duration to get end time
      const gameEndTime = new Date(gameStartTime);
      gameEndTime.setHours(gameStartTime.getHours() + (reservation.duration || 2));
      
      const now = new Date();
      
      if (now < gameStartTime) {
        return 'upcoming';
      } else if (now >= gameEndTime) {
        return 'completed';
      } else {
        return 'in-progress';
      }
    } catch (error) {
      console.error("Error determining game status:", error);
      return reservation.status || 'upcoming';
    }
  };

  const gameStatus = determineGameStatus();
  const isGameCompleted = gameStatus === 'completed';
  const isGameUpcoming = gameStatus === 'upcoming';
  const isAdmin = userRole === "admin";

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      onJoin(reservation.id, playerName, userId);
      toast({
        title: "Joined Game",
        description: "You have successfully joined the game!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Join",
        description: "There was an error joining the game. Please try again.",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      onCancel(reservation.id, userId);
      toast({
        title: "Cancelled Reservation",
        description: "You have cancelled your reservation.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Cancel",
        description: "There was an error cancelling your reservation. Please try again.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleJoinWaitingList = () => {
    onJoinWaitingList(reservation.id, userId);
    toast({
      title: "Joined Waiting List",
      description: "You have joined the waiting list for this game.",
    });
  };

  const handleLeaveWaitingList = () => {
    onLeaveWaitingList(reservation.id, userId);
    toast({
      title: "Left Waiting List",
      description: "You have left the waiting list for this game.",
    });
  };

  const handleUpdateSummary = (reservationId: number, summary: any, playerStats: any[]) => {
    updateGameSummary(reservationId, summary, playerStats);
    setShowSummaryDialog(false);
  };

  const isUserInWaitingList = reservation.waitingList?.includes(userId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long", 
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = () => {
    if (reservation.startTime && reservation.duration) {
      const [startHour, startMinute] = reservation.startTime.split(':').map(Number);
      const endHour = startHour + reservation.duration;
      const endMinute = startMinute;
      return `${reservation.startTime} - ${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    }
    return reservation.time;
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header with football background */}
        <div className="relative h-32 bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=200&fit=crop&crop=center')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-green-700/80" />
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <Badge 
              className={`${
                gameStatus === 'upcoming' ? 'bg-green-500 hover:bg-green-600' : 
                gameStatus === 'completed' ? 'bg-blue-500 hover:bg-blue-600' :
                gameStatus === 'in-progress' ? 'bg-orange-500 hover:bg-orange-600' :
                'bg-red-500 hover:bg-red-600'
              } text-white font-semibold px-3 py-1`}
            >
              {gameStatus}
            </Badge>
          </div>

          {/* Game Title */}
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-xl font-bold">
              {reservation.title || reservation.pitchName}
            </h2>
            <p className="text-green-100 text-sm">
              {formatDate(reservation.date)}
            </p>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Game Details */}
          <div className="space-y-3">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-3 text-green-600" />
              <span className="font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                {formatTime()}
              </span>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-3" />
              <span>{reservation.location}</span>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4 mr-3" />
              <span>
                {reservation.lineup?.length || 0} / {reservation.maxPlayers} players
              </span>
              <span className="ml-auto text-blue-500 font-medium">
                {reservation.maxPlayers - (reservation.lineup?.length || 0)} spots left
              </span>
            </div>
          </div>

          {/* Players List */}
          {reservation.lineup && reservation.lineup.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Players Joined:
              </h4>
              <ScrollArea className="h-20 rounded-md border dark:border-gray-700">
                <div className="p-2 flex flex-wrap gap-2">
                  {reservation.lineup.map((player) => (
                    <div 
                      key={player.userId} 
                      className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-full px-2 py-1"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.playerName}`} />
                        <AvatarFallback className="text-xs">{player.playerName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-700 dark:text-gray-200">
                        {player.playerName}
                      </span>
                      {player.mvp && <Badge className="ml-1 text-xs">MVP</Badge>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {isAdmin ? (
              // Admin Actions
              <div className="w-full">
                {isGameUpcoming ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Reservation
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reservation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this reservation? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteReservation?.(reservation.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : isGameCompleted ? (
                  <Button 
                    onClick={() => setShowSummaryDialog(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Add Summary
                  </Button>
                ) : null}
              </div>
            ) : (
              // Player Actions (only show for non-completed games)
              !isGameCompleted && (
                <>
                  {isUserJoined(reservation.id, userId) ? (
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="w-full"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Reservation"}
                    </Button>
                  ) : isFull ? (
                    !isUserInWaitingList ? (
                      <Button variant="secondary" onClick={handleJoinWaitingList} className="w-full">
                        Join Waiting List
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={handleLeaveWaitingList} className="w-full">
                        Leave Waiting List
                      </Button>
                    )
                  ) : (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Your Name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full"
                      />
                      <Button 
                        onClick={handleJoin} 
                        disabled={isJoining} 
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                      >
                        {isJoining ? "Joining..." : "Join Game"}
                      </Button>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Summary Dialog */}
      {showSummaryDialog && isGameCompleted && (
        <GameSummaryDialog
          isOpen={showSummaryDialog}
          onClose={() => setShowSummaryDialog(false)}
          reservation={reservation}
          onUpdateSummary={handleUpdateSummary}
        />
      )}
    </>
  );
};

export default ReservationCard;
