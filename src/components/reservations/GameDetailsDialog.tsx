import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { MapPin, Calendar, Clock, Users, X, ExternalLink, UserMinus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Reservation } from "@/context/ReservationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PlayerSuspensionDialog from "./PlayerSuspensionDialog";
import ActionConfirmationDialog from "./ActionConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import PlayerProfileDialog from "@/components/ui/PlayerProfileDialog";

interface GameDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  isAdmin?: boolean;
  onStatusChange?: (status: 'upcoming' | 'completed' | 'cancelled') => void;
  currentUserId: string;
  actualMaxPlayers: number;
  showAdminControls?: boolean;
  onKickPlayer?: (reservationId: number, playerId: string) => void;
  onSuspendPlayer?: (playerId: string, days: number, reason: string) => void;
  pitchImage?: string;
  onPlayerClick?: (playerId: string) => void;
}

const GameDetailsDialog: React.FC<GameDetailsDialogProps> = ({
  isOpen,
  onClose,
  reservation,
  isAdmin = false,
  currentUserId,
  actualMaxPlayers,
  onKickPlayer,
  onSuspendPlayer,
  pitchImage,
  onPlayerClick
}) => {
  const { toast } = useToast();
  const [suspensionDialog, setSuspensionDialog] = useState<{
    isOpen: boolean;
    playerName: string;
    playerId: string;
  }>({
    isOpen: false,
    playerName: "",
    playerId: ""
  });

  const [kickConfirmation, setKickConfirmation] = useState<{
    isOpen: boolean;
    playerName: string;
    playerId: string;
  }>({
    isOpen: false,
    playerName: "",
    playerId: ""
  });

  const [playerProfile, setPlayerProfile] = useState<{ isOpen: boolean; playerId: string; playerName?: string; }>({
    isOpen: false,
    playerId: "",
    playerName: ""
  });

  // Add null checks and error handling
  if (!reservation) {
    console.error("No reservation data provided to GameDetailsDialog");
    return null;
  }

  let formattedDate = "Invalid Date";
  try {
    if (reservation.date) {
      formattedDate = format(parseISO(reservation.date), "EEEE, MMMM d, yyyy");
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    formattedDate = reservation.date || "Invalid Date";
  }

  const joinedPlayers = reservation.lineup?.filter(p => (p.status === 'joined' || !p.status)) || [];
  const waitingList = reservation.waitingList || [];

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  const handleKickPlayer = (playerId: string, playerName: string) => {
    if (reservation.status !== 'upcoming') {
      toast({
        title: "Cannot kick player",
        description: "Players can only be kicked from upcoming games.",
        variant: "destructive",
      });
      return;
    }

    setKickConfirmation({
      isOpen: true,
      playerName,
      playerId
    });
  };

  const confirmKickPlayer = async () => {
    if (onKickPlayer && kickConfirmation.playerId) {
      await onKickPlayer(reservation.id, kickConfirmation.playerId);
      toast({
        title: "Player Kicked",
        description: `${kickConfirmation.playerName} has been removed from the game.`,
      });
    }
    setKickConfirmation({ isOpen: false, playerName: "", playerId: "" });
  };

  const getGameImage = () => {
    if (pitchImage) return pitchImage;
    if (reservation.backgroundImage) return reservation.backgroundImage;
    return `https://source.unsplash.com/800x400/?football,pitch,${encodeURIComponent(reservation.pitchName || 'football').split(" ").join(",")}`;
  };

  const isUserInGame = joinedPlayers.some(player => player.userId === currentUserId);
  const isUserInWaitingList = waitingList.includes(currentUserId);

  const handleOpenPlayerProfile = (userId: string, playerName?: string) => {
    setPlayerProfile({
      isOpen: true,
      playerId: userId,
      playerName
    });
    if (onPlayerClick) onPlayerClick(userId, playerName);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">
                {reservation.title || reservation.pitchName || "Game Details"}
              </DialogTitle>
            </div>
            <DialogDescription className="mt-2">
              Game details and player management
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-48 w-full">
            <img
              src={getGameImage()}
              alt={reservation.pitchName || "Game pitch"}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://source.unsplash.com/800x400/?football,pitch";
              }}
            />
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Game Information</h3>
                <Badge className={`${
                  reservation.status === 'upcoming' ? 'bg-green-500' : 
                  reservation.status === 'completed' ? 'bg-blue-500' :
                  'bg-red-500'
                }`}>
                  {(reservation.status || 'upcoming').charAt(0).toUpperCase() + (reservation.status || 'upcoming').slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{reservation.startTime && reservation.endTime 
                    ? `${reservation.startTime} - ${reservation.endTime}`
                    : reservation.time || "Time not specified"}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{`${joinedPlayers.length}/${actualMaxPlayers} players`}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{reservation.city || reservation.location || "Location not specified"}</span>
                    {reservation.location && (
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(reservation.location)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center text-xs"
                      >
                        View on Maps <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {reservation.price && (
                <div className="flex items-center mt-1 text-sm">
                  <span className="font-medium mr-1">Price:</span>
                  <span>{reservation.price} JD per player</span>
                </div>
              )}

              {/* Show current user status */}
              {currentUserId && (
                <div className="flex items-center mt-2 text-sm">
                  {isUserInGame && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      You're in this game
                    </Badge>
                  )}
                  {isUserInWaitingList && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      You're on the waiting list
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <Tabs defaultValue="players">
              <TabsList className="mb-4">
                <TabsTrigger value="players">Players ({joinedPlayers.length})</TabsTrigger>
                <TabsTrigger value="waiting">Waiting List ({waitingList.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="players">
                <ScrollArea className="h-[250px] border rounded-md p-2">
                  {joinedPlayers.length > 0 ? (
                    <div className="space-y-2">
                      {joinedPlayers.map((player, index) => (
                        <div key={player.userId || index} className="flex items-center justify-between p-3 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors">
                          <div className="flex items-center cursor-pointer" onClick={() => handleOpenPlayerProfile(player.userId, player.playerName || player.name)}>
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback className="bg-teal-100 text-teal-700">
                                {getInitials(player.playerName || player.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{player.playerName || player.name || `Player ${player.userId?.substring(0, 4)}`}</p>
                              {player.joinedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Joined: {format(new Date(player.joinedAt), "MMM d, h:mm a")}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {player.userId === currentUserId && (
                              <Badge className="bg-blue-500">You</Badge>
                            )}
                            
                            {isAdmin && player.userId !== currentUserId && reservation.status === 'upcoming' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleKickPlayer(player.userId, player.playerName || player.name || 'Player')}
                                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <UserMinus className="h-3 w-3 mr-1" />
                                Kick Player
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No players have joined yet.</p>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="waiting">
                <ScrollArea className="h-[250px] border rounded-md p-2">
                  {waitingList.length > 0 ? (
                    <div className="space-y-2">
                      {waitingList.map((userId, index) => (
                        <div key={userId} className="flex items-center justify-between p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center cursor-pointer" onClick={() => handleOpenPlayerProfile(userId, `Player ${userId.substring(0, 6)}`)}>
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback className="bg-amber-100 text-amber-700">
                                {(index + 1).toString()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {`Player ${userId.substring(0, 6)}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Position #{index + 1} in queue
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {userId === currentUserId && (
                              <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                                You
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">The waiting list is empty.</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <PlayerSuspensionDialog
        isOpen={suspensionDialog.isOpen}
        onClose={() => setSuspensionDialog({ isOpen: false, playerName: "", playerId: "" })}
        playerName={suspensionDialog.playerName}
        playerId={suspensionDialog.playerId}
        onConfirm={onSuspendPlayer || (() => {})}
      />

      <ActionConfirmationDialog
        open={kickConfirmation.isOpen}
        onOpenChange={(open) => !open && setKickConfirmation({ isOpen: false, playerName: "", playerId: "" })}
        onConfirm={confirmKickPlayer}
        title="Kick Player"
        description={`Are you sure you want to kick ${kickConfirmation.playerName} from this game? This action cannot be undone.`}
        confirmButtonText="Kick Player"
        confirmButtonVariant="destructive"
      />

      <PlayerProfileDialog
        isOpen={playerProfile.isOpen}
        onClose={() => setPlayerProfile({ isOpen: false, playerId: "", playerName: "" })}
        playerId={playerProfile.playerId}
        playerName={playerProfile.playerName}
      />
    </>
  );
};

export default GameDetailsDialog;
