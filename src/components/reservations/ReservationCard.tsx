import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useReservation, Reservation } from "@/context/ReservationContext";
import { MapPin, Calendar, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import GameSummaryDialog from "./GameSummaryDialog";
import { sendGameCancellationNotification } from "@/utils/emailNotifications";

// Import Player from context but rename it to avoid conflict with local interface
import { Player as ReservationPlayer } from "@/context/ReservationContext";

// Extend the Player interface to include email property
interface Player extends ReservationPlayer {
  email?: string; // Add email as optional property
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

interface PlayerDetailsDialogProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

const PlayerDetailsDialog: React.FC<PlayerDetailsDialogProps> = ({
  player,
  isOpen,
  onClose,
  userRole
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.playerName}`} />
              <AvatarFallback>{player.playerName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {player.playerName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <Badge className="ml-2" variant={player.status === 'joined' ? 'default' : 'secondary'}>
                {player.status}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Joined:</span>
              <span className="ml-2">{player.joinedAt ? new Date(player.joinedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          
          {/* Player Stats Section */}
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium">Player Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Games Played:</span>
                <div className="font-medium">12</div>
              </div>
              <div>
                <span className="text-muted-foreground">Win Rate:</span>
                <div className="font-medium">75%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Goals Scored:</span>
                <div className="font-medium">8</div>
              </div>
              <div>
                <span className="text-muted-foreground">MVP Awards:</span>
                <div className="font-medium">3</div>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium">Badges</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Top Scorer</Badge>
              <Badge variant="outline">Team Player</Badge>
              <Badge variant="outline">Regular</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);

  const { updateGameSummary } = useReservation();

  // Calculate start and end time (duration is in hours, show min/hours intelligently)
  const getStartEndTime = () => {
    try {
      // Assume startTime is "HH:mm", duration is number (hours, can be float)
      const [startHour, startMinute] = reservation.startTime.split(':').map(Number);
      const start = new Date(reservation.date);
      start.setHours(startHour || 0, startMinute || 0, 0, 0);
      const end = new Date(start);
      // duration in hours, so convert to min to add correctly
      if (reservation.duration) {
        end.setMinutes(start.getMinutes() + reservation.duration * 60);
      }
      const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return { start: fmt(start), end: fmt(end) };
    } catch (e) {
      return { start: reservation.startTime, end: "?" };
    }
  };

  const { start, end } = getStartEndTime();

  // Determine if game is completed based on time
  const determineGameStatus = () => {
    try {
      const gameDate = new Date(reservation.date);
      const [startHour, startMinute] = reservation.startTime?.split(':').map(Number) || [0, 0];
      const gameStartTime = new Date(gameDate);
      gameStartTime.setHours(startHour, startMinute, 0, 0);
      
      // Add duration to get end time (assuming duration is in hours)
      const gameEndTime = new Date(gameStartTime);
      gameEndTime.setHours(gameStartTime.getHours() + (reservation.duration || 2));
      
      const now = new Date();
      
      if (now < gameStartTime) {
        return 'upcoming';
      } else if (now >= gameEndTime) {
        return 'completed';
      } else {
        return 'in-progress'; // Currently playing
      }
    } catch (error) {
      // Fallback to reservation status if date parsing fails
      console.error("Error determining game status:", error);
      return reservation.status || 'upcoming';
    }
  };

  const gameStatus = determineGameStatus();
  const isGameCompleted = gameStatus === 'completed';
  const isGameUpcoming = gameStatus === 'upcoming';
  const isAdmin = userRole === "admin";

  // Get pitch photos (assuming we have them in the reservation or use defaults)
  const pitchPhotos = reservation.additionalImages && reservation.additionalImages.length > 0
    ? [reservation.imageUrl, ...reservation.additionalImages].filter(Boolean)
    : [reservation.imageUrl || `https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop&crop=center`];

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

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsPlayerDialogOpen(true);
  };

  const handleUpdateSummary = (reservationId: number, summary: any, playerStats: any[]) => {
    updateGameSummary(reservationId, summary, playerStats);
    setShowSummaryDialog(false);
  };

  const handleDeleteReservation = async () => {
    setIsCancelling(true);
    try {
      // Send emails BEFORE deletion for demo purposes
      if (reservation.lineup && reservation.lineup.length > 0) {
        const emails = reservation.lineup
          .map((p) => p.email).filter(Boolean);
        await sendGameCancellationNotification(
          {
            title: reservation.title,
            date: reservation.date,
            time: reservation.startTime,
            location: reservation.location
          },
          emails
        );
      }
      onDeleteReservation?.(reservation.id);
      toast({
        title: "Reservation Deleted",
        description: "All joined players have been notified by email.",
      });
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: "Could not notify players or delete reservation.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
      setShowDeleteConfirm(false);
    }
  };

  const isUserInWaitingList = reservation.waitingList?.includes(userId);

  const getPlayerAvatar = (player: Player) => {
    const nameParts = player.playerName.split(" ");
    const initials = nameParts.map((part) => part[0].toUpperCase()).join("");

    return (
      <Avatar className="h-8 w-8 cursor-pointer" onClick={() => handlePlayerClick(player)}>
        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.playerName}`} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    );
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % pitchPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + pitchPhotos.length) % pitchPhotos.length);
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 overflow-hidden">
        <div className="flex">
          {/* Pitch Photo Section */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <img
              src={pitchPhotos[currentPhotoIndex]}
              alt={reservation.pitchName}
              className="w-full h-full object-cover"
            />
            {pitchPhotos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {pitchPhotos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content Section */}
          <CardContent className="flex-1 p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {reservation.title || reservation.pitchName}
                </h2>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    {reservation.date}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    {/* Show start and end */}
                    {start} - {end} ({reservation.duration}h)
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    {reservation.location}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    {reservation.lineup?.length || 0}/{reservation.maxPlayers}
                  </div>
                </div>
              </div>
              
              {/* Status Badge (replaces three dots) */}
              <Badge 
                className={`${
                  gameStatus === 'upcoming' ? 'bg-green-500' : 
                  gameStatus === 'completed' ? 'bg-blue-500' :
                  gameStatus === 'in-progress' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
              >
                {gameStatus}
              </Badge>
            </div>

            <Separator className="my-3" />

            {/* Only for Admin: Toggle section to show Players Joined */}
            {isAdmin && (
              <div>
                <Button variant="secondary" size="sm" className="mb-2" onClick={() => setShowPlayers((s) => !s)}>
                  {showPlayers ? "Hide Players" : "Show Players"}
                </Button>
                {showPlayers && (
                  <ScrollArea className="h-[100px] rounded-md border dark:border-gray-700 mb-2">
                    <div className="p-2 space-y-2">
                      {reservation.lineup && reservation.lineup.map((player) => (
                        <div 
                          key={player.userId} 
                          className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => handlePlayerClick(player)}
                        >
                          <div className="flex items-center space-x-2">
                            {getPlayerAvatar(player)}
                            <p className="text-sm text-gray-800 dark:text-gray-100">
                              {player.playerName}
                            </p>
                            {player.mvp && <Badge className="ml-1 text-xs">MVP</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col items-stretch mt-4">
              {isAdmin ? (
                // Admin Actions
                <div className="flex gap-2">
                  {isGameUpcoming ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-2 text-base font-bold"
                    >
                      Delete Reservation
                    </Button>
                  ) : isGameCompleted ? (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => setShowSummaryDialog(true)}
                      className="bg-teal-600 hover:bg-teal-700"
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
                        size="sm"
                        className="w-full py-2 text-base font-bold"
                      >
                        {isCancelling ? "Cancelling..." : "Cancel Reservation"}
                      </Button>
                    ) : isFull ? (
                      !isUserInWaitingList ? (
                        <Button variant="secondary" onClick={handleJoinWaitingList} size="sm">
                          Join Waiting List
                        </Button>
                      ) : (
                        <Button variant="secondary" onClick={handleLeaveWaitingList} size="sm">
                          Leave Waiting List
                        </Button>
                      )
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          placeholder="Your Name"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          className="max-w-[120px] h-8"
                        />
                        <Button 
                          onClick={handleJoin} 
                          disabled={isJoining} 
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
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
        </div>
      </Card>

      {/* Player Details Dialog */}
      {selectedPlayer && (
        <PlayerDetailsDialog
          player={selectedPlayer}
          isOpen={isPlayerDialogOpen}
          onClose={() => setIsPlayerDialogOpen(false)}
          userRole={userRole}
        />
      )}

      {/* Game Summary Dialog */}
      {showSummaryDialog && isGameCompleted && (
        <GameSummaryDialog
          isOpen={showSummaryDialog}
          onClose={() => setShowSummaryDialog(false)}
          reservation={reservation}
          onUpdateSummary={handleUpdateSummary}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reservation? This will notify all players via email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isCancelling}
              onClick={handleDeleteReservation}
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReservationCard;
