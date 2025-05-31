import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Shield,
  Star,
  Zap,
  Target,
  Trophy,
  UserX,
  AlertCircle,
} from "lucide-react";
import { Reservation } from "@/types/reservation";
import WaitingListDisplay from "./WaitingListDisplay";
import PlayerSuspensionDialog from "./PlayerSuspensionDialog";
import { kickPlayer as kickPlayerApi } from "@/services/adminReservationApi"; // make sure it's imported
import { toast, useToast } from "@/hooks/use-toast";

interface GameDetailsDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onStatusChange: (status: "upcoming" | "completed" | "cancelled") => void;
  currentUserId: string;
  actualMaxPlayers: number;
  onKickPlayer?: (reservationId: number, playerId: string) => void;
  onSuspendPlayer?: (
    playerId: string,
    suspensionDays: number,
    reason: string
  ) => void;
  pitchImage?: string;
  onPlayerClick?: (playerId: string, playerName?: string) => void;
}

const GameDetailsDialog: React.FC<GameDetailsDialogProps> = ({
  reservation,
  isOpen,
  onClose,
  isAdmin,
  onStatusChange,
  currentUserId,
  actualMaxPlayers,
  onKickPlayer,
  onSuspendPlayer,
  pitchImage,
  onPlayerClick,
}) => {
  const [kickDialog, setKickDialog] = useState<{
    open: boolean;
    playerId: string;
    playerName: string;
  } | null>(null);
  const navigate = useNavigate();

  const currentPlayers = reservation.lineup?.length || 0;

  // Check if we're within 3 days of game start for kick functionality
  const gameDateTime = new Date(
    `${reservation.date}T${reservation.time || "00:00"}`
  );
  const now = new Date();
  const threeDaysBeforeGame = new Date(
    gameDateTime.getTime() - 3 * 24 * 60 * 60 * 1000
  );
  const canKickPlayers =
    isAdmin &&
    now >= threeDaysBeforeGame &&
    reservation.status !== "completed" &&
    reservation.lineup &&
    reservation.lineup.length > 0;

  let formattedDate = "Invalid Date";
  try {
    if (reservation.date) {
      formattedDate = format(parseISO(reservation.date), "EEEE, MMMM d, yyyy");
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    formattedDate = reservation.date?.substring(0, 10) || "Invalid Date";
  }

  const getCardImage = () => {
    if (pitchImage) return pitchImage;
    if (reservation.backgroundImage) return reservation.backgroundImage;
    return `https://source.unsplash.com/800x400/?football,pitch,${encodeURIComponent(
      reservation.pitchName || "football"
    )
      .split(" ")
      .join(",")}`;
  };

  const handleAddPlayerFromWaitlist = (userId: string) => {
    console.log("Adding player from waitlist:", userId);
  };

  const handleRemoveFromWaitlist = (userId: string) => {
    console.log("Removing from waitlist:", userId);
  };

  const handlePlayerClick = (playerId: string, playerName?: string) => {
    if (!playerId || playerId.length < 10) {
      console.warn("Invalid player ID:", playerId);
      return;
    }

    console.log("Navigating to player profile with ID:", playerId);
    onClose();
    navigate(`/player-profile/${playerId}`);
  };

  const handleKickPlayer = (playerId: string, playerName: string) => {
    setKickDialog({ open: true, playerId, playerName });
    // console.log("Opening kick dialog for player:", playerId, playerName);
    if (onKickPlayer) {
      onKickPlayer(reservation.id, playerId);
    }
  };

  const { toast } = useToast();

  const confirmKickPlayer = async (
    playerId: string,
    suspensionDays: number,
    reason: string
  ) => {
    try {
      await kickPlayerApi(
        reservation.id.toString(),
        playerId,
        reason,
        suspensionDays
      );
      toast({
        title: "Player Kicked",
        description: `${kickDialog?.playerName} was removed and suspended.`,
      });

      // Optionally, refresh the dialog or close it
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to kick player",
        variant: "destructive",
      });
    } finally {
      setKickDialog(null);
    }
  };

  const renderPlayerItem = (player: any, index: number) => (
    <div
      key={player.userId}
      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <div
        className="flex items-center space-x-3 flex-1 cursor-pointer"
        onClick={() => handlePlayerClick(player.userId, player.name)}
      >
        <span className="text-sm font-medium text-gray-500 w-6">
          {index + 1}
        </span>
        <Avatar className="h-8 w-8">
          <AvatarImage src={player.avatarUrl} alt={player.name} />
          <AvatarFallback>
            {player.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-sm">{player.name}</p>
          <p className="text-xs text-muted-foreground">
            Joined {new Date(player.joinedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Kick button for admins within 3 days */}
      {!canKickPlayers && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleKickPlayer(player.userId, player.name)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
        >
          <UserX className="h-3 w-3 mr-1" />
          Kick
        </Button>
      )}
    </div>
  );

  const renderHighlights = () => {
    if (!reservation.highlights || reservation.highlights.length === 0) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          <p>No highlights recorded for this game</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {reservation.highlights.map((highlight, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {highlight.type === "goal" && (
                  <Target className="h-5 w-5 text-green-600" />
                )}
                {highlight.type === "assist" && (
                  <Zap className="h-5 w-5 text-blue-600" />
                )}
                {highlight.type === "save" && (
                  <Shield className="h-5 w-5 text-purple-600" />
                )}
                {highlight.type === "mvp" && (
                  <Trophy className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{highlight.playerName}</p>
                <p className="text-xs text-muted-foreground">
                  {highlight.type.charAt(0).toUpperCase() +
                    highlight.type.slice(1)}
                  {highlight.minute && ` - ${highlight.minute}'`}
                </p>
              </div>
            </div>
            {highlight.description && (
              <p className="text-xs text-muted-foreground max-w-xs">
                {highlight.description}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {reservation.title || reservation.pitchName}
            </DialogTitle>
            <DialogDescription>
              Game details and player lineup
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Game Image */}
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <img
                  src={getCardImage()}
                  alt={reservation.pitchName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://source.unsplash.com/800x400/?football,pitch";
                  }}
                />
                <div className="absolute top-4 right-4">
                  <Badge
                    className={`${
                      reservation.status === "upcoming"
                        ? "bg-green-500"
                        : reservation.status === "completed"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  >
                    {(reservation.status || "upcoming")
                      .charAt(0)
                      .toUpperCase() +
                      (reservation.status || "upcoming").slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Game Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>
                      {reservation.startTime && reservation.endTime
                        ? `${reservation.startTime} - ${reservation.endTime}`
                        : reservation.time || "Time TBD"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>{reservation.city || reservation.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>
                      {currentPlayers}/{actualMaxPlayers} players
                    </span>
                  </div>
                </div>
              </div>

              {/* Player Lineup */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Player Lineup ({currentPlayers})
                  {canKickPlayers && (
                    <div className="ml-4 text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Kick window active
                    </div>
                  )}
                </h3>
                <div className="space-y-2">
                  {reservation.lineup && reservation.lineup.length > 0 ? (
                    reservation.lineup.map((player, index) =>
                      renderPlayerItem(player, index)
                    )
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No players have joined this game yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Waiting List - Only show for admin */}
              {isAdmin && (
                <WaitingListDisplay
                  reservation={reservation}
                  onAddPlayerFromWaitlist={handleAddPlayerFromWaitlist}
                  onRemoveFromWaitlist={handleRemoveFromWaitlist}
                />
              )}

              {/* Game Highlights */}
              {reservation.status === "completed" && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Game Highlights
                  </h3>
                  {renderHighlights()}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Kick Player Dialog */}
      {kickDialog && (
        <PlayerSuspensionDialog
          isOpen={kickDialog.open}
          onClose={() => setKickDialog(null)}
          playerName={kickDialog.playerName}
          playerId={kickDialog.playerId}
          onConfirm={confirmKickPlayer}
          actionType="kick"
        />
      )}
    </>
  );
};

export default GameDetailsDialog;
