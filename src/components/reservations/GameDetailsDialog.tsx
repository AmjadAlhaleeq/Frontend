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
import LoadingButton from "@/components/ui/loading-button";
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
  Info,
} from "lucide-react";
import { Reservation } from "@/types/reservation";
import WaitingListDisplay from "./WaitingListDisplay";
import PlayerSuspensionDialog from "./PlayerSuspensionDialog";
import { kickPlayer as kickPlayerApi } from "@/services/adminReservationApi";
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
  const [kickingPlayers, setKickingPlayers] = useState<Record<string, boolean>>(
    {}
  );
  const [localReservation, setLocalReservation] = useState(reservation);
  const navigate = useNavigate();

  const currentPlayers = localReservation.lineup?.length || 0;

  // Check if we're within 3 days of game start for kick functionality
  const gameDateTime = new Date(
    `${localReservation.date}T${localReservation.time || "00:00"}`
  );
  const now = new Date();
  const threeDaysBeforeGame = new Date(
    gameDateTime.getTime() - 3 * 24 * 60 * 60 * 1000
  );
  const canKickPlayers =
    isAdmin &&
    now >= threeDaysBeforeGame &&
    localReservation.status !== "completed" &&
    localReservation.lineup &&
    localReservation.lineup.length > 0;

  let formattedDate = "Invalid Date";
  try {
    if (localReservation.date) {
      formattedDate = format(
        parseISO(localReservation.date),
        "EEEE, MMMM d, yyyy"
      );
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    formattedDate = localReservation.date?.substring(0, 10) || "Invalid Date";
  }

  const getCardImage = () => {
    if (pitchImage) return pitchImage;
    if (localReservation.backgroundImage)
      return localReservation.backgroundImage;
    return `https://source.unsplash.com/800x400/?football,pitch,${encodeURIComponent(
      localReservation.pitchName || "football"
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
  };

  const handleLocationClick = () => {
    const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(
      localReservation.location
    )}`;
    window.open(googleMapsUrl, "_blank");
  };

  const { toast } = useToast();

  const confirmKickPlayer = async (
    playerId: string,
    suspensionDays: number,
    reason: string
  ) => {
    try {
      console.log("confirmKickPlayer called with:", {
        playerId,
        suspensionDays,
        reason,
        reservationId: localReservation.id,
        reservationBackendId: localReservation.backendId,
      });

      setKickingPlayers((prev) => ({ ...prev, [playerId]: true }));

      // Use backendId if available, otherwise fall back to id
      const reservationIdToUse =
        localReservation.backendId || localReservation.id.toString();
      console.log("Using reservation ID for kick:", reservationIdToUse);

      await kickPlayerApi(reservationIdToUse, playerId, reason, suspensionDays);

      // Update local state to remove the player immediately
      setLocalReservation((prev) => ({
        ...prev,
        lineup:
          prev.lineup?.filter((player) => player.userId !== playerId) || [],
      }));

      toast({
        title: "Player Kicked",
        description: `${kickDialog?.playerName} was removed and suspended.`,
      });
    } catch (error: any) {
      console.error("Error in confirmKickPlayer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to kick player",
        variant: "destructive",
      });
    } finally {
      setKickingPlayers((prev) => ({ ...prev, [playerId]: false }));
      setKickDialog(null);
    }
  };

  const renderHighlights = () => {
    if (
      !localReservation.highlights ||
      localReservation.highlights.length === 0
    ) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          <p>No highlights recorded for this game</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {localReservation.highlights.map((highlight, index) => (
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

  const renderPlayersList = () => {
    if (!localReservation.lineup || localReservation.lineup.length === 0) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          <p>No players have joined this game yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {localReservation.lineup.map((player, index) => (
          <div
            key={player.userId}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={player.avatar} />
                <AvatarFallback>
                  {player.name?.charAt(0).toUpperCase() || "P"}
                </AvatarFallback>
              </Avatar>
              <div>
                <button
                  onClick={() => handlePlayerClick(player.userId, player.name)}
                  className="font-medium text-sm hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {player.name || player.playerName}
                </button>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(player.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {isAdmin && !canKickPlayers && (
              <LoadingButton
                variant="outline"
                size="sm"
                onClick={() => handleKickPlayer(player.userId, player.name)}
                loading={kickingPlayers[player.userId]}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <UserX className="h-4 w-4 mr-1" />
                Kick
              </LoadingButton>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Get pitch details from reservation
  const pitch = (localReservation as any).pitch;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {localReservation.title || localReservation.pitchName}
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
                  alt={localReservation.pitchName}
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
                      localReservation.status === "upcoming"
                        ? "bg-green-500"
                        : localReservation.status === "completed"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  >
                    {(localReservation.status || "upcoming")
                      .charAt(0)
                      .toUpperCase() +
                      (localReservation.status || "upcoming").slice(1)}
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
                      {localReservation.startTime && localReservation.endTime
                        ? `${localReservation.startTime} - ${localReservation.endTime}`
                        : localReservation.time || "Time TBD"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                    <button
                      onClick={handleLocationClick}
                      className="text-current hover:text-teal-600 dark:hover:text-teal-400 hover:underline transition-colors text-left"
                    >
                      {localReservation.city || localReservation.location}
                    </button>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>
                      {currentPlayers}/{actualMaxPlayers} players
                    </span>
                  </div>
                </div>
              </div>

              {/* Pitch Information */}
              {pitch && (
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center text-teal-700 dark:text-teal-400">
                    <Info className="h-5 w-5 mr-2" />
                    Pitch Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Name:</p>
                      <p className="text-muted-foreground">
                        {pitch.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Format:</p>
                      <p className="text-muted-foreground">
                        {pitch.playersPerSide
                          ? `${pitch.playersPerSide} vs ${pitch.playersPerSide}`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-medium">Description:</p>
                      <p className="text-muted-foreground">
                        {pitch.description || "No description available"}
                      </p>
                    </div>
                    {pitch.services && (
                      <div className="md:col-span-2">
                        <p className="font-medium">Facilities:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(pitch.services)
                            .filter(
                              ([key, value]) => key !== "type" && value === true
                            )
                            .map(([facility]) => (
                              <Badge
                                key={facility}
                                variant="outline"
                                className="text-xs"
                              >
                                {facility.replace("_", " ")}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                {renderPlayersList()}
              </div>

              {/* Waiting List - Only show for admin */}
              {isAdmin && (
                <WaitingListDisplay
                  reservation={localReservation}
                  onAddPlayerFromWaitlist={handleAddPlayerFromWaitlist}
                  onRemoveFromWaitlist={handleRemoveFromWaitlist}
                />
              )}

              {/* Game Highlights */}
              {localReservation.status === "completed" && (
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
