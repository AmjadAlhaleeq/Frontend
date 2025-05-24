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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

// Email notification setup (placeholder function, ready for API)
async function sendCancellationEmail(playerEmail: string, playerName: string, pitchName: string, date: string, startTime: string) {
  // TODO: Connect to real email API or use your backend endpoint here.
  // Placeholder: log outgoing email.
  console.log(`Sending cancellation email to ${playerEmail} for reservation at ${pitchName} on ${date} at ${startTime}`);
}

// Utility to add minutes to a time string "HH:mm"
function addMinutesToTime(startTime: string, minutesToAdd: number): string {
  const [hour, min] = startTime.split(":").map(Number);
  if (isNaN(hour) || isNaN(min)) return startTime;
  const baseDate = new Date();
  baseDate.setHours(hour, min, 0, 0);
  baseDate.setMinutes(baseDate.getMinutes() + minutesToAdd);
  return baseDate.toTimeString().slice(0, 5); // "HH:mm"
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { updateGameSummary } = useReservation();

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

  const handleDeleteReservation = async () => {
    setShowDeleteDialog(false);
    // Call deletion
    onDeleteReservation?.(reservation.id);

    // Send email notifications to joined players, if emails exist
    if (reservation.lineup && reservation.lineup.length > 0) {
      reservation.lineup.forEach(player => {
        // Try to get the email from localStorage based on userId
        const emailFromStorage = localStorage.getItem(`playerEmail_${player.userId}`);
        if (emailFromStorage) {
          sendCancellationEmail(
            emailFromStorage,
            player.playerName,
            reservation.pitchName,
            reservation.date,
            reservation.startTime || reservation.time
          );
        }
      });
    }
  };

  // Correct end time calc (add duration in minutes to start time)
  let startDisplay = reservation.startTime || reservation.time; // fallback to whatever is present
  let endDisplay = startDisplay;
  if (startDisplay && reservation.duration) {
    const minutes = Number(reservation.duration);
    if (!isNaN(minutes)) {
      endDisplay = addMinutesToTime(startDisplay, minutes);
    }
  }

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
                    Start: {startDisplay} | End: {endDisplay}
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

            {/* ADMIN ONLY: Expandable Accordion for Players Joined */}
            {isAdmin && (
              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="players">
                  <AccordionTrigger className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Show Players Joined
                  </AccordionTrigger>
                  <AccordionContent>
                    {reservation.lineup && reservation.lineup.length > 0 ? (
                      <ScrollArea className="h-[120px] rounded-md border dark:border-gray-700">
                        <div className="p-2 space-y-2">
                          {reservation.lineup.map((player) => (
                            <div 
                              key={player.userId} 
                              className="flex items-center space-x-2 py-1 px-2 rounded"
                            >
                              {getPlayerAvatar(player)}
                              <p className="text-sm text-gray-800 dark:text-gray-100">
                                {player.playerName}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 py-3 text-center border rounded-md">
                        No players have joined yet.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* Remove "Players Joined" for all users, only admin can see in accordion */}
            {/* ...rest of UI... */}

            <div className="flex flex-col items-stretch mt-4">
              {isAdmin ? (
                // Admin Actions
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full"
                  size="lg"
                >
                  Delete Reservation
                </Button>
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reservation? This action cannot be undone and will notify joined players.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReservation} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </>
  );
};

export default ReservationCard;
